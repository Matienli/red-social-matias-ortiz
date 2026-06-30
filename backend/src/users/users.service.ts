import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { PerfilUsuario, Usuario, UsuarioDocument } from './schemas/usuario.schema';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto';
import { UsuarioListadoRespuesta } from './users.types';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<UsuarioDocument>,
  ) {}

  async findByCorreo(correo: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findOne({ correo: correo.toLowerCase() }).exec();
  }

  async findByNombreUsuario(nombreUsuario: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findOne({ nombreUsuario }).exec();
  }

  async findByIdentificador(identificador: string): Promise<UsuarioDocument | null> {
    const valor = identificador.trim();
    if (valor.includes('@')) {
      return this.findByCorreo(valor);
    }
    return this.findByNombreUsuario(valor);
  }

  async findByIdentificadorConContrasena(
    identificador: string,
  ): Promise<UsuarioDocument | null> {
    const valor = identificador.trim();
    if (valor.includes('@')) {
      return this.usuarioModel
        .findOne({ correo: valor.toLowerCase() })
        .select('+contrasena')
        .exec();
    }
    return this.usuarioModel
      .findOne({ nombreUsuario: valor })
      .select('+contrasena')
      .exec();
  }

  async findById(id: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findById(id).exec();
  }

  async findByIdConContrasena(id: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findById(id).select('+contrasena').exec();
  }

  async create(data: Partial<Usuario>): Promise<UsuarioDocument> {
    return new this.usuarioModel(data).save();
  }

  async listarTodos(): Promise<UsuarioListadoRespuesta[]> {
    const usuarios = await this.usuarioModel
      .find()
      .sort({ createdAt: -1 })
      .exec();

    return usuarios.map((usuario) => this.mapearListado(usuario));
  }

  async crearDesdeAdmin(dto: CrearUsuarioAdminDto): Promise<UsuarioListadoRespuesta> {
    const correoExistente = await this.findByCorreo(dto.correo);
    if (correoExistente) {
      throw new ConflictException('El correo ya está registrado');
    }

    const usuarioExistente = await this.findByNombreUsuario(dto.nombreUsuario);
    if (usuarioExistente) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    const contrasenaHash = await bcrypt.hash(dto.contrasena, 10);
    const usuario = await this.create({
      nombre: dto.nombre.trim(),
      apellido: dto.apellido.trim(),
      correo: dto.correo.toLowerCase().trim(),
      nombreUsuario: dto.nombreUsuario.trim(),
      contrasena: contrasenaHash,
      fechaNacimiento: dto.fechaNacimiento,
      descripcionBreve: dto.descripcionBreve.trim(),
      perfil: dto.perfil,
      activo: true,
    });

    return this.mapearListado(usuario);
  }

  async deshabilitar(id: string): Promise<UsuarioListadoRespuesta> {
    const usuario = await this.usuarioModel.findById(id).exec();
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    usuario.activo = false;
    await usuario.save();
    return this.mapearListado(usuario);
  }

  async rehabilitar(id: string): Promise<UsuarioListadoRespuesta> {
    const usuario = await this.usuarioModel.findById(id).exec();
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    usuario.activo = true;
    await usuario.save();
    return this.mapearListado(usuario);
  }

  private mapearListado(usuario: UsuarioDocument): UsuarioListadoRespuesta {
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
      activo: usuario.activo ?? true,
      createdAt: usuario.createdAt,
    };
  }
}
