import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ListarPublicacionesQueryDto } from './dto/listar-publicaciones-query.dto';
import {
  ComentarioRespuesta,
  PaginacionRespuesta,
  PublicacionRespuesta,
  mapearAutor,
} from './publicaciones.types';
import { ComentariosService } from './comentarios.service';
import { UploadsService } from '../uploads/uploads.service';
import { PerfilUsuario } from '../users/schemas/usuario.schema';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<PublicacionDocument>,
    private readonly comentariosService: ComentariosService,
    private readonly uploadsService: UploadsService,
  ) {}

  async listar(
    query: ListarPublicacionesQueryDto,
    usuarioId?: string,
  ): Promise<PaginacionRespuesta<PublicacionRespuesta>> {
    const offset = query.offset ?? 0;
    const limit = query.limit ?? 10;
    const orden = query.orden ?? 'fecha';
    const filtro = this.construirFiltroListado(query.usuarioId);

    const [publicaciones, total] = await Promise.all([
      this.publicacionModel
        .find(filtro)
        .sort(orden === 'me-gusta' ? { cantidadMeGusta: -1, createdAt: -1 } : { createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate('autorId', 'nombre apellido nombreUsuario imagenPerfil')
        .exec(),
      this.publicacionModel.countDocuments(filtro).exec(),
    ]);

    return {
      datos: publicaciones.map((publicacion) =>
        this.mapearPublicacion(publicacion, usuarioId),
      ),
      offset,
      limit,
      total,
    };
  }

  async obtenerPorId(
    publicacionId: string,
    usuarioId?: string,
  ): Promise<PublicacionRespuesta> {
    const publicacion = await this.buscarPublicacionActiva(publicacionId);
    await publicacion.populate('autorId', 'nombre apellido nombreUsuario imagenPerfil');
    return this.mapearPublicacion(publicacion, usuarioId);
  }

  async listarPorAutor(
    autorId: string,
    limite: number,
    incluirComentarios = false,
  ): Promise<PublicacionRespuesta[]> {
    const publicaciones = await this.publicacionModel
      .find({ autorId: new Types.ObjectId(autorId), activa: { $ne: false } })
      .sort({ createdAt: -1 })
      .limit(limite)
      .populate('autorId', 'nombre apellido nombreUsuario imagenPerfil')
      .exec();

    let comentariosMap = new Map<string, ComentarioRespuesta[]>();

    if (incluirComentarios && publicaciones.length) {
      comentariosMap = await this.comentariosService.listarPorPublicaciones(
        publicaciones.map((publicacion) => publicacion._id.toString()),
      );
    }

    return publicaciones.map((publicacion) => {
      const respuesta = this.mapearPublicacion(publicacion, autorId);
      if (incluirComentarios) {
        respuesta.comentarios =
          comentariosMap.get(publicacion._id.toString()) ?? [];
      }
      return respuesta;
    });
  }

  async crear(
    autorId: string,
    dto: CrearPublicacionDto,
    imagen?: Express.Multer.File,
  ): Promise<PublicacionRespuesta> {
    let imagenUrl = dto.imagenUrl;
    let imagenPublicId: string | undefined;

    if (imagen) {
      const subida = await this.uploadsService.subirImagen(
        imagen,
        'red-social/publicaciones',
      );
      imagenUrl = subida.url;
      imagenPublicId = subida.publicId;
    }

    const publicacion = await new this.publicacionModel({
      titulo: dto.titulo.trim(),
      descripcion: dto.descripcion.trim(),
      autorId: new Types.ObjectId(autorId),
      imagenUrl,
      imagenPublicId,
      meGusta: [],
      cantidadMeGusta: 0,
      activa: true,
    }).save();

    await publicacion.populate('autorId', 'nombre apellido nombreUsuario imagenPerfil');
    return this.mapearPublicacion(publicacion, autorId);
  }

  async darBajaLogica(
    publicacionId: string,
    usuarioId: string,
    perfilUsuario: string,
  ): Promise<void> {
    const publicacion = await this.buscarPublicacionActiva(publicacionId);
    const esAutor = publicacion.autorId.toString() === usuarioId;
    const esAdministrador = perfilUsuario === PerfilUsuario.ADMINISTRADOR;

    if (!esAutor && !esAdministrador) {
      throw new ForbiddenException(
        'Solo el autor o un administrador pueden dar de baja la publicación',
      );
    }

    publicacion.activa = false;
    await publicacion.save();
  }

  async darMeGusta(
    publicacionId: string,
    usuarioId: string,
  ): Promise<PublicacionRespuesta> {
    const publicacion = await this.buscarPublicacionActiva(publicacionId);
    const userObjectId = new Types.ObjectId(usuarioId);

    const yaLeGusta = publicacion.meGusta.some((id) => id.toString() === usuarioId);
    if (yaLeGusta) {
      throw new ConflictException('Ya diste me gusta a esta publicación');
    }

    publicacion.meGusta = [...publicacion.meGusta, userObjectId];
    publicacion.cantidadMeGusta = publicacion.meGusta.length;

    await publicacion.save();
    await publicacion.populate('autorId', 'nombre apellido nombreUsuario imagenPerfil');
    return this.mapearPublicacion(publicacion, usuarioId);
  }

  async quitarMeGusta(
    publicacionId: string,
    usuarioId: string,
  ): Promise<PublicacionRespuesta> {
    const publicacion = await this.buscarPublicacionActiva(publicacionId);
    const userObjectId = new Types.ObjectId(usuarioId);

    const yaLeGusta = publicacion.meGusta.some((id) => id.toString() === usuarioId);
    if (!yaLeGusta) {
      throw new BadRequestException('No diste me gusta a esta publicación');
    }

    publicacion.meGusta = publicacion.meGusta.filter((id) => !id.equals(userObjectId));
    publicacion.cantidadMeGusta = publicacion.meGusta.length;

    await publicacion.save();
    await publicacion.populate('autorId', 'nombre apellido nombreUsuario imagenPerfil');
    return this.mapearPublicacion(publicacion, usuarioId);
  }

  private construirFiltroListado(usuarioId?: string) {
    const filtro: {
      activa: { $ne: false };
      autorId?: Types.ObjectId;
    } = { activa: { $ne: false } };

    if (usuarioId) {
      filtro.autorId = new Types.ObjectId(usuarioId);
    }

    return filtro;
  }

  private async buscarPublicacionActiva(publicacionId: string): Promise<PublicacionDocument> {
    const publicacion = await this.publicacionModel.findById(publicacionId).exec();
    if (!publicacion || publicacion.activa === false) {
      throw new NotFoundException('Publicación no encontrada');
    }
    return publicacion;
  }

  private mapearPublicacion(
    publicacion: PublicacionDocument,
    usuarioId?: string,
  ): PublicacionRespuesta {
    const autor = publicacion.autorId as unknown as {
      _id: Types.ObjectId;
      nombre: string;
      apellido: string;
      nombreUsuario: string;
      imagenPerfil?: string;
    };

    const meGustaIds = publicacion.meGusta ?? [];

    return {
      id: publicacion._id.toString(),
      titulo: publicacion.titulo,
      descripcion:
        publicacion.descripcion ??
        (publicacion as PublicacionDocument & { mensaje?: string }).mensaje ??
        '',
      imagenUrl: publicacion.imagenUrl,
      autor: mapearAutor(autor),
      cantidadMeGusta: publicacion.cantidadMeGusta ?? meGustaIds.length,
      meGustaPorMi: usuarioId
        ? meGustaIds.some((id) => id.toString() === usuarioId)
        : false,
      createdAt: publicacion.createdAt as Date,
      updatedAt: publicacion.updatedAt as Date,
    };
  }
}
