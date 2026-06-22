import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';

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
}
