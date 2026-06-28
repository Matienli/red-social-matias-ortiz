export interface AutorPublicacion {
  id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  imagenPerfil?: string;
}

export interface Comentario {
  id: string;
  mensaje: string;
  modificado?: boolean;
  createdAt: string;
  updatedAt?: string;
  autor: AutorPublicacion;
}

export interface Publicacion {
  id: string;
  titulo: string;
  descripcion: string;
  imagenUrl?: string;
  autor: AutorPublicacion;
  cantidadMeGusta: number;
  meGustaPorMi: boolean;
  comentarios?: Comentario[];
  createdAt: string;
  updatedAt: string;
}

export type OrdenPublicaciones = 'fecha' | 'me-gusta';

export interface ListarPublicacionesParams {
  offset?: number;
  limit?: number;
  orden?: OrdenPublicaciones;
  usuarioId?: string;
}

export interface PublicacionesPaginadas {
  datos: Publicacion[];
  offset: number;
  limit: number;
  total: number;
}

export interface ListarComentariosParams {
  offset?: number;
  limit?: number;
}

export interface ComentariosPaginados {
  datos: Comentario[];
  offset: number;
  limit: number;
  total: number;
}

export interface CrearPublicacionRequest {
  titulo: string;
  descripcion: string;
  imagen?: File;
}

export interface PerfilCompleto {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcionBreve: string;
  imagenPerfil?: string;
  perfil: 'usuario' | 'administrador';
  ultimasPublicaciones: Publicacion[];
}
