import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Injectable, inject, signal } from '@angular/core';

import { Router } from '@angular/router';

import { Observable, catchError, map, of, tap } from 'rxjs';

import { environment } from '../../environments/environment';

import { AuthResponse, LoginRequest, RegistroRequest, Usuario } from '../models/user.model';

import { ModalService } from './modal';



const MINUTOS_RESTANTES_AVISO = 5;



@Injectable({

  providedIn: 'root',

})

export class AuthService {

  private readonly storageKey = 'red_social_auth';

  private readonly http = inject(HttpClient);

  private readonly router = inject(Router);

  private readonly modal = inject(ModalService);

  private logoutTimer: ReturnType<typeof setTimeout> | null = null;

  private sessionWarningTimer: ReturnType<typeof setTimeout> | null = null;

  private sessionWarningShown = false;



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



  refreshToken(): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refrescar`, {}).pipe(

      tap((response) => this.persistSession(response)),

    );

  }



  logout(): void {

    this.clearSessionTimers();

    this.sessionWarningShown = false;

    localStorage.removeItem(this.storageKey);

    this.currentUser.set(null);

    this.isAuthenticated.set(false);

  }



  validarSesionConServidor(): Observable<boolean> {

    const token = this.obtenerTokenAlmacenado();

    if (!token) {

      return of(false);

    }



    return this.http

      .post<Usuario>(

        `${environment.apiUrl}/auth/autorizar`,

        {},

        {

          headers: new HttpHeaders({

            Authorization: `Bearer ${token}`,

          }),

        },

      )

      .pipe(

        tap((usuario) => {

          this.actualizarUsuarioAlmacenado(usuario);

          this.currentUser.set(usuario);

          this.isAuthenticated.set(true);

          this.iniciarTimersSesion(token);

        }),

        map(() => true),

        catchError(() => {

          this.logout();

          return of(false);

        }),

      );

  }



  tieneTokenAlmacenado(): boolean {

    return !!this.obtenerTokenAlmacenado();

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

    this.clearSessionTimers();

    this.sessionWarningShown = false;

    localStorage.setItem(this.storageKey, JSON.stringify(response));

    this.currentUser.set(response.usuario);

    this.isAuthenticated.set(true);

    this.iniciarTimersSesion(response.accessToken);

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

    this.iniciarTimersSesion(token);

  }



  private iniciarTimersSesion(token: string): void {

    this.scheduleSessionWarning(token);

    this.scheduleAutoLogout(token);

  }



  private scheduleSessionWarning(token: string): void {

    if (this.sessionWarningTimer) {

      clearTimeout(this.sessionWarningTimer);

    }



    const exp = this.getTokenExpiration(token);

    if (!exp) {

      return;

    }



    const warningAt = exp * 1000 - MINUTOS_RESTANTES_AVISO * 60 * 1000;

    const delay = warningAt - Date.now();



    if (delay <= 0) {

      if (!this.sessionWarningShown && !this.isTokenExpired(token)) {

        void this.mostrarAvisoExtensionSesion();

      }

      return;

    }



    this.sessionWarningTimer = setTimeout(() => {

      void this.mostrarAvisoExtensionSesion();

    }, delay);

  }



  private async mostrarAvisoExtensionSesion(): Promise<void> {

    if (this.sessionWarningShown || !this.hasValidSession()) {

      return;

    }



    this.sessionWarningShown = true;



    const extender = await this.modal.confirm({

      title: 'Sesión por vencer',

      message:

        'Quedan 5 minutos de sesión. ¿Deseás extender tu sesión?',

      type: 'info',

      confirmLabel: 'Sí, extender',

      cancelLabel: 'No',

    });



    if (!extender) {

      return;

    }



    this.refreshToken().subscribe({

      error: () => {

        this.modal.open({

          title: 'Error',

          message: 'No pudimos renovar la sesión. Volvé a iniciar sesión.',

          type: 'error',

        });

      },

    });

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



  private clearSessionTimers(): void {

    if (this.logoutTimer) {

      clearTimeout(this.logoutTimer);

      this.logoutTimer = null;

    }

    if (this.sessionWarningTimer) {

      clearTimeout(this.sessionWarningTimer);

      this.sessionWarningTimer = null;

    }

  }



  private readStoredToken(): string | null {

    return this.obtenerTokenAlmacenado();

  }



  private obtenerTokenAlmacenado(): string | null {

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



  private actualizarUsuarioAlmacenado(usuario: Usuario): void {

    const raw = localStorage.getItem(this.storageKey);

    if (!raw) {

      return;

    }

    try {

      const stored = JSON.parse(raw) as AuthResponse;

      localStorage.setItem(

        this.storageKey,

        JSON.stringify({ ...stored, usuario }),

      );

    } catch {

      /* ignorar datos corruptos */

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


