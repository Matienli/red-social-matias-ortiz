export type PerfilUsuario = 'usuario' | 'administrador';

export interface Usuario {
  id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcionBreve: string;
  imagenPerfil?: string;
  perfil: PerfilUsuario;
}

export interface LoginRequest {
  identificador: string;
  contrasena: string;
}

export interface RegistroRequest {
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  contrasena: string;
  fechaNacimiento: string;
  descripcionBreve: string;
  perfil: PerfilUsuario;
  imagenPerfil?: File;
}

export interface AuthResponse {
  accessToken: string;
  usuario: Usuario;
}
