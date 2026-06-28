import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { PerfilUsuario, UsuarioDocument } from '../users/schemas/usuario.schema';
import { UploadsService } from '../uploads/uploads.service';
import { PublicacionesService } from '../publicaciones/publicaciones.service';
import { PublicacionRespuesta } from '../publicaciones/publicaciones.types';
import { JwtTokenPayload } from './auth.types';
import { UsuarioJwt } from './decorators/current-user.decorator';

export interface UsuarioRespuesta {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcionBreve: string;
  imagenPerfil?: string;
  perfil: PerfilUsuario;
}

export interface AuthRespuesta {
  accessToken: string;
  usuario: UsuarioRespuesta;
}

export interface PerfilCompletoRespuesta extends UsuarioRespuesta {
  ultimasPublicaciones: PublicacionRespuesta[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly uploadsService: UploadsService,
    private readonly publicacionesService: PublicacionesService,
  ) {}

  async registro(
    dto: RegistroDto,
    imagenPerfil?: Express.Multer.File,
  ): Promise<AuthRespuesta> {
    const correoExistente = await this.usersService.findByCorreo(dto.correo);
    if (correoExistente) {
      throw new ConflictException('El correo ya está registrado');
    }

    const usuarioExistente = await this.usersService.findByNombreUsuario(
      dto.nombreUsuario,
    );
    if (usuarioExistente) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    const contrasenaHash = await bcrypt.hash(dto.contrasena, 10);

    let imagenUrl: string | undefined;
    let imagenPublicId: string | undefined;

    if (imagenPerfil) {
      const subida = await this.uploadsService.subirImagenPerfil(imagenPerfil);
      imagenUrl = subida.url;
      imagenPublicId = subida.publicId;
    }

    const usuario = await this.usersService.create({
      nombre: dto.nombre.trim(),
      apellido: dto.apellido.trim(),
      correo: dto.correo.toLowerCase().trim(),
      nombreUsuario: dto.nombreUsuario.trim(),
      contrasena: contrasenaHash,
      fechaNacimiento: dto.fechaNacimiento,
      descripcionBreve: dto.descripcionBreve.trim(),
      imagenPerfil: imagenUrl,
      imagenPublicId,
      perfil: dto.perfil ?? PerfilUsuario.USUARIO,
    });

    return this.construirRespuestaAuth(usuario);
  }

  async login(dto: LoginDto): Promise<AuthRespuesta> {
    const usuario = await this.usersService.findByIdentificadorConContrasena(
      dto.identificador,
    );

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const contrasenaValida = await bcrypt.compare(dto.contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.construirRespuestaAuth(usuario);
  }

  async perfil(userId: string): Promise<PerfilCompletoRespuesta> {
    const usuario = await this.usersService.findById(userId);
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const ultimasPublicaciones = await this.publicacionesService.listarPorAutor(
      userId,
      3,
      true,
    );

    return {
      ...this.mapearUsuario(usuario),
      ultimasPublicaciones,
    };
  }

  async autorizar(userId: string): Promise<UsuarioRespuesta> {
    const usuario = await this.usersService.findById(userId);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Token inválido');
    }

    return this.mapearUsuario(usuario);
  }

  async refreshToken(usuarioJwt: UsuarioJwt): Promise<AuthRespuesta> {
    const usuario = await this.usersService.findById(usuarioJwt.userId);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Token inválido');
    }

    const accessToken = this.jwtService.sign(this.construirPayloadToken(usuarioJwt));

    return {
      accessToken,
      usuario: this.mapearUsuario(usuario),
    };
  }

  private construirRespuestaAuth(usuario: UsuarioDocument): AuthRespuesta {
    const accessToken = this.jwtService.sign(
      this.construirPayloadToken({
        userId: usuario._id.toString(),
        correo: usuario.correo,
        nombreUsuario: usuario.nombreUsuario,
        perfil: usuario.perfil,
      }),
    );

    return {
      accessToken,
      usuario: this.mapearUsuario(usuario),
    };
  }

  private construirPayloadToken(usuario: UsuarioJwt): JwtTokenPayload {
    return {
      sub: usuario.userId,
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };
  }

  private mapearUsuario(usuario: UsuarioDocument): UsuarioRespuesta {
    return {
      id: usuario._id.toString(),
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      fechaNacimiento: usuario.fechaNacimiento,
      descripcionBreve: usuario.descripcionBreve,
      imagenPerfil: usuario.imagenPerfil,
      perfil: usuario.perfil,
    };
  }
}
