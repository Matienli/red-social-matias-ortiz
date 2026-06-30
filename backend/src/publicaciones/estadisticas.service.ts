import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { Comentario, ComentarioDocument } from './schemas/comentario.schema';
import { RangoFechasQueryDto } from './dto/rango-fechas-query.dto';

export interface PublicacionesPorUsuarioItem {
  usuarioId: string;
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  cantidad: number;
}

export interface ComentariosPorDiaItem {
  fecha: string;
  cantidad: number;
}

export interface ComentariosPorPublicacionItem {
  publicacionId: string;
  titulo: string;
  cantidad: number;
}

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<ComentarioDocument>,
  ) {}

  async publicacionesPorUsuario(
    query: RangoFechasQueryDto,
  ): Promise<{ datos: PublicacionesPorUsuarioItem[]; total: number }> {
    const filtroFecha = this.construirFiltroFecha(query);

    const resultados = await this.publicacionModel.aggregate<{
      _id: Types.ObjectId;
      cantidad: number;
      autor: { nombreUsuario: string; nombre: string; apellido: string }[];
    }>([
      {
        $match: {
          activa: { $ne: false },
          ...filtroFecha,
        },
      },
      { $group: { _id: '$autorId', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'autor',
        },
      },
      { $sort: { cantidad: -1 } },
    ]);

    const datos = resultados.map((item) => ({
      usuarioId: item._id.toString(),
      nombreUsuario: item.autor[0]?.nombreUsuario ?? 'Desconocido',
      nombre: item.autor[0]?.nombre ?? '',
      apellido: item.autor[0]?.apellido ?? '',
      cantidad: item.cantidad,
    }));

    return {
      datos,
      total: datos.reduce((suma, item) => suma + item.cantidad, 0),
    };
  }

  async comentariosEnPeriodo(
    query: RangoFechasQueryDto,
  ): Promise<{ total: number; porDia: ComentariosPorDiaItem[] }> {
    const filtroFecha = this.construirFiltroFecha(query, 'createdAt');
    const comentariosActivos = [
      { $match: filtroFecha },
      {
        $lookup: {
          from: 'publicaciones',
          localField: 'publicacionId',
          foreignField: '_id',
          as: 'publicacion',
        },
      },
      { $match: { 'publicacion.activa': { $ne: false } } },
    ];

    const [totalResult, porDia] = await Promise.all([
      this.comentarioModel.aggregate<{ total: number }>([
        ...comentariosActivos,
        { $count: 'total' },
      ]),
      this.comentarioModel.aggregate<{ _id: string; cantidad: number }>([
        ...comentariosActivos,
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            cantidad: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return {
      total: totalResult[0]?.total ?? 0,
      porDia: porDia.map((item) => ({ fecha: item._id, cantidad: item.cantidad })),
    };
  }

  async comentariosPorPublicacion(
    query: RangoFechasQueryDto,
  ): Promise<{ datos: ComentariosPorPublicacionItem[]; total: number }> {
    const filtroFecha = this.construirFiltroFecha(query);

    const resultados = await this.comentarioModel.aggregate<{
      _id: Types.ObjectId;
      cantidad: number;
      publicacion: { titulo: string; activa?: boolean }[];
    }>([
      { $match: filtroFecha },
      { $group: { _id: '$publicacionId', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: 'publicaciones',
          localField: '_id',
          foreignField: '_id',
          as: 'publicacion',
        },
      },
      { $match: { 'publicacion.activa': { $ne: false } } },
      { $sort: { cantidad: -1 } },
      { $limit: 50 },
    ]);

    const datos = resultados.map((item) => ({
      publicacionId: item._id.toString(),
      titulo: item.publicacion[0]?.titulo ?? 'Publicación eliminada',
      cantidad: item.cantidad,
    }));

    return {
      datos,
      total: datos.reduce((suma, item) => suma + item.cantidad, 0),
    };
  }

  private construirFiltroFecha(
    query: RangoFechasQueryDto,
    campo = 'createdAt',
  ): Record<string, unknown> {
    const filtro: Record<string, Date> = {};

    if (query.desde) {
      filtro.$gte = new Date(query.desde);
    }
    if (query.hasta) {
      const hasta = new Date(query.hasta);
      hasta.setHours(23, 59, 59, 999);
      filtro.$lte = hasta;
    }

    if (!Object.keys(filtro).length) {
      return {};
    }

    return { [campo]: filtro };
  }
}
