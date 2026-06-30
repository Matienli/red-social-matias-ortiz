import { PerfilUsuario } from './schemas/usuario.schema';

export interface UsuarioListadoRespuesta {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcionBreve: string;
  imagenPerfil?: string;
  perfil: PerfilUsuario;
  activo: boolean;
  createdAt?: Date;
}
