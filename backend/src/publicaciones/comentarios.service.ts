import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario, ComentarioDocument } from './schemas/comentario.schema';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import {
  ComentarioRespuesta,
  PaginacionRespuesta,
  mapearAutor,
} from './publicaciones.types';
import { ListarComentariosQueryDto } from './dto/listar-comentarios-query.dto';
import { ActualizarComentarioDto } from './dto/actualizar-comentario.dto';

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
  ): Promise<ComentarioRespuesta> {
    const publicacion = await this.publicacionModel.findById(publicacionId).exec();
    if (!publicacion || publicacion.activa === false) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const comentario = await new this.comentarioModel({
      publicacionId: new Types.ObjectId(publicacionId),
      autorId: new Types.ObjectId(autorId),
      mensaje: mensaje.trim(),
      modificado: false,
    }).save();

    await comentario.populate('autorId', 'nombre apellido nombreUsuario imagenPerfil');
    return this.mapearComentario(comentario);
  }

  async actualizar(
    comentarioId: string,
    usuarioId: string,
    dto: ActualizarComentarioDto,
  ): Promise<ComentarioRespuesta> {
    const comentario = await this.comentarioModel.findById(comentarioId).exec();
    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (comentario.autorId.toString() !== usuarioId) {
      throw new ForbiddenException('Solo el autor puede modificar el comentario');
    }

    if (dto.mensaje !== undefined) {
      comentario.mensaje = dto.mensaje.trim();
    }

    comentario.modificado = true;
    await comentario.save();
    await comentario.populate('autorId', 'nombre apellido nombreUsuario imagenPerfil');
    return this.mapearComentario(comentario);
  }

  async listarPorPublicacion(publicacionId: string): Promise<ComentarioRespuesta[]> {
    const comentarios = await this.comentarioModel
      .find({ publicacionId: new Types.ObjectId(publicacionId) })
      .sort({ createdAt: 1 })
      .populate('autorId', 'nombre apellido nombreUsuario imagenPerfil')
      .exec();

    return comentarios.map((comentario) => this.mapearComentario(comentario));
  }

  async listarPorPublicacionPaginado(
    publicacionId: string,
    query: ListarComentariosQueryDto,
  ): Promise<PaginacionRespuesta<ComentarioRespuesta>> {
    const publicacion = await this.publicacionModel.findById(publicacionId).exec();
    if (!publicacion || publicacion.activa === false) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const offset = query.offset ?? 0;
    const limit = query.limit ?? 5;
    const filtro = { publicacionId: new Types.ObjectId(publicacionId) };

    const [comentarios, total] = await Promise.all([
      this.comentarioModel
        .find(filtro)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate('autorId', 'nombre apellido nombreUsuario imagenPerfil')
        .exec(),
      this.comentarioModel.countDocuments(filtro).exec(),
    ]);

    return {
      datos: comentarios.map((comentario) => this.mapearComentario(comentario)),
      offset,
      limit,
      total,
    };
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
      modificado: comentario.modificado ?? false,
      createdAt: comentario.createdAt as Date,
      updatedAt: comentario.updatedAt as Date,
      autor: mapearAutor(autor),
    };
  }
}
