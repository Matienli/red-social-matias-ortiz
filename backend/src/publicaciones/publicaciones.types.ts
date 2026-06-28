import { Types } from 'mongoose';

export interface AutorPublicacion {
  id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  imagenPerfil?: string;
}

export interface ComentarioRespuesta {
  id: string;
  mensaje: string;
  modificado: boolean;
  createdAt: Date;
  updatedAt: Date;
  autor: AutorPublicacion;
}

export interface PublicacionRespuesta {
  id: string;
  titulo: string;
  descripcion: string;
  imagenUrl?: string;
  autor: AutorPublicacion;
  cantidadMeGusta: number;
  meGustaPorMi: boolean;
  comentarios?: ComentarioRespuesta[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginacionRespuesta<T> {
  datos: T[];
  offset: number;
  limit: number;
  total: number;
}

export function mapearAutor(autor: {
  _id: Types.ObjectId;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  imagenPerfil?: string;
}): AutorPublicacion {
  return {
    id: autor._id.toString(),
    nombre: autor.nombre,
    apellido: autor.apellido,
    nombreUsuario: autor.nombreUsuario,
    imagenPerfil: autor.imagenPerfil,
  };
}
