import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CrearUsuarioAdminRequest, UsuarioListado } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  listar(): Observable<UsuarioListado[]> {
    return this.http.get<UsuarioListado[]>(this.baseUrl);
  }

  crear(data: CrearUsuarioAdminRequest): Observable<UsuarioListado> {
    return this.http.post<UsuarioListado>(this.baseUrl, data);
  }

  deshabilitar(id: string): Observable<UsuarioListado> {
    return this.http.delete<UsuarioListado>(`${this.baseUrl}/${id}`);
  }

  rehabilitar(id: string): Observable<UsuarioListado> {
    return this.http.post<UsuarioListado>(`${this.baseUrl}/${id}/alta`, {});
  }
}
