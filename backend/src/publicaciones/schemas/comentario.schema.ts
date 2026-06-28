import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ComentarioDocument = HydratedDocument<Comentario>;

@Schema({ timestamps: true, collection: 'comentarios' })
export class Comentario {
  @Prop({ type: Types.ObjectId, ref: 'Publicacion', required: true, index: true })
  publicacionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  autorId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 500 })
  mensaje: string;

  @Prop({ default: false })
  modificado: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
