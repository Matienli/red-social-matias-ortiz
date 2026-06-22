import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PublicacionDocument = HydratedDocument<Publicacion>;

@Schema({ timestamps: true, collection: 'publicaciones' })
export class Publicacion {
  @Prop({ required: true, trim: true })
  titulo: string;

  @Prop({ required: true })
  mensaje: string;

  @Prop()
  imagenUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  autorId: Types.ObjectId;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
