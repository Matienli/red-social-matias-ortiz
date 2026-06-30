import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsuarioDocument = HydratedDocument<Usuario>;

export enum PerfilUsuario {
  USUARIO = 'usuario',
  ADMINISTRADOR = 'administrador',
}

@Schema({ timestamps: true, collection: 'usuarios' })
export class Usuario {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, trim: true })
  apellido: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  correo: string;

  @Prop({ required: true, unique: true, trim: true })
  nombreUsuario: string;

  @Prop({ required: true, select: false })
  contrasena: string;

  @Prop({ required: true })
  fechaNacimiento: string;

  @Prop({ required: true, maxlength: 200 })
  descripcionBreve: string;

  @Prop()
  imagenPerfil?: string;

  @Prop()
  imagenPublicId?: string;

  @Prop({ enum: PerfilUsuario, default: PerfilUsuario.USUARIO })
  perfil: PerfilUsuario;

  @Prop({ default: true })
  activo: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
