export interface RangoFechasParams {
  desde?: string;
  hasta?: string;
}

export interface PublicacionesPorUsuarioEstadistica {
  usuarioId: string;
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  cantidad: number;
}

export interface ComentariosPorDiaEstadistica {
  fecha: string;
  cantidad: number;
}

export interface ComentariosPorPublicacionEstadistica {
  publicacionId: string;
  titulo: string;
  cantidad: number;
}
