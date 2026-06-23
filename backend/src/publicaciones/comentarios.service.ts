import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario, ComentarioDocument } from './schemas/comentario.schema';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { ComentarioRespuesta, mapearAutor } from './publicaciones.types';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<ComentarioDocument>,
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<PublicacionDocument>,
  ) {}

  async crear(
    publicacionId: string,
    autorId: string,
    mensaje: string,
  ): Promise<ComentarioDocument> {
    const publicacion = await this.publicacionModel.findById(publicacionId).exec();
    if (!publicacion || publicacion.activa === false) {
      throw new NotFoundException('Publicación no encontrada');
    }

    return new this.comentarioModel({
      publicacionId: new Types.ObjectId(publicacionId),
      autorId: new Types.ObjectId(autorId),
      mensaje: mensaje.trim(),
    }).save();
  }

  async listarPorPublicacion(publicacionId: string): Promise<ComentarioRespuesta[]> {
    const comentarios = await this.comentarioModel
      .find({ publicacionId: new Types.ObjectId(publicacionId) })
      .sort({ createdAt: 1 })
      .populate('autorId', 'nombre apellido nombreUsuario imagenPerfil')
      .exec();

    return comentarios.map((comentario) => this.mapearComentario(comentario));
  }

  async listarPorPublicaciones(
    publicacionIds: string[],
  ): Promise<Map<string, ComentarioRespuesta[]>> {
    if (!publicacionIds.length) {
      return new Map();
    }

    const objectIds = publicacionIds.map((id) => new Types.ObjectId(id));
    const comentarios = await this.comentarioModel
      .find({ publicacionId: { $in: objectIds } })
      .sort({ createdAt: 1 })
      .populate('autorId', 'nombre apellido nombreUsuario imagenPerfil')
      .exec();

    const mapa = new Map<string, ComentarioRespuesta[]>();
    for (const comentario of comentarios) {
      const publicacionId = comentario.publicacionId.toString();
      const lista = mapa.get(publicacionId) ?? [];
      lista.push(this.mapearComentario(comentario));
      mapa.set(publicacionId, lista);
    }

    return mapa;
  }

  private mapearComentario(comentario: ComentarioDocument): ComentarioRespuesta {
    const autor = comentario.autorId as unknown as {
      _id: Types.ObjectId;
      nombre: string;
      apellido: string;
      nombreUsuario: string;
      imagenPerfil?: string;
    };

    return {
      id: comentario._id.toString(),
      mensaje: comentario.mensaje,
      createdAt: comentario.createdAt as Date,
      autor: mapearAutor(autor),
    };
  }
}
