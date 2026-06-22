import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegistroRequest, Usuario } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageKey = 'red_social_auth';
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private logoutTimer: ReturnType<typeof setTimeout> | null = null;

  readonly currentUser = signal<Usuario | null>(this.loadUser());
  readonly isAuthenticated = signal(this.hasValidSession());

  constructor() {
    this.validateSession();
  }

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
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
    localStorage.removeItem(this.storageKey);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    const token = this.readStoredToken();
    if (!token) {
      return null;
    }
    if (this.isTokenExpired(token)) {
      this.logout();
      void this.router.navigate(['/login']);
      return null;
    }
    return token;
  }

  hasValidSession(): boolean {
    const token = this.readStoredToken();
    return !!token && !this.isTokenExpired(token);
  }

  private persistSession(response: AuthResponse): void {
    localStorage.setItem(this.storageKey, JSON.stringify(response));
    this.currentUser.set(response.usuario);
    this.isAuthenticated.set(true);
    this.scheduleAutoLogout(response.accessToken);
  }

  private validateSession(): void {
    const token = this.readStoredToken();
    if (!token) {
      return;
    }
    if (this.isTokenExpired(token)) {
      this.logout();
      return;
    }
    this.scheduleAutoLogout(token);
  }

  private scheduleAutoLogout(token: string): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    const exp = this.getTokenExpiration(token);
    if (!exp) {
      return;
    }

    const remainingMs = exp * 1000 - Date.now();
    if (remainingMs <= 0) {
      this.logout();
      void this.router.navigate(['/login']);
      return;
    }

    this.logoutTimer = setTimeout(() => {
      this.logout();
      void this.router.navigate(['/login']);
    }, remainingMs);
  }

  private readStoredToken(): string | null {
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

  private loadUser(): Usuario | null {
    if (!this.hasValidSession()) {
      return null;
    }
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

  private isTokenExpired(token: string): boolean {
    const exp = this.getTokenExpiration(token);
    if (!exp) {
      return true;
    }
    return Date.now() >= exp * 1000;
  }

  private getTokenExpiration(token: string): number | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return null;
      }
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as {
        exp?: number;
      };
      return decoded.exp ?? null;
    } catch {
      return null;
    }
  }
}
