import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegistroRequest, Usuario } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageKey = 'red_social_auth';
  readonly currentUser = signal<Usuario | null>(this.loadUser());
  readonly isAuthenticated = signal(!!this.getToken());

  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => this.persistSession(response)),
    );
  }

  register(data: RegistroRequest): Observable<AuthResponse> {
    const formData = new FormData();
    formData.append('nombre', data.nombre);
    formData.append('apellido', data.apellido);
    formData.append('correo', data.correo);
    formData.append('nombreUsuario', data.nombreUsuario);
    formData.append('contrasena', data.contrasena);
    formData.append('fechaNacimiento', data.fechaNacimiento);
    formData.append('descripcionBreve', data.descripcionBreve);
    formData.append('perfil', data.perfil);
    if (data.imagenPerfil) {
      formData.append('imagenPerfil', data.imagenPerfil);
    }

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, formData).pipe(
      tap((response) => this.persistSession(response)),
    );
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }
    try {
      return (JSON.parse(raw) as AuthResponse).accessToken;
    } catch {
      return null;
    }
  }

  private persistSession(response: AuthResponse): void {
    localStorage.setItem(this.storageKey, JSON.stringify(response));
    this.currentUser.set(response.usuario);
    this.isAuthenticated.set(true);
  }

  private loadUser(): Usuario | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }
    try {
      return (JSON.parse(raw) as AuthResponse).usuario;
    } catch {
      return null;
    }
  }
}
