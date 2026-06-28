import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Comentario,
  ComentariosPaginados,
  CrearPublicacionRequest,
  ListarComentariosParams,
  ListarPublicacionesParams,
  PerfilCompleto,
  Publicacion,
  PublicacionesPaginadas,
} from '../models/publicacion.model';

@Injectable({
  providedIn: 'root',
})
export class PublicacionesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/publicaciones`;

  listar(params: ListarPublicacionesParams = {}): Observable<PublicacionesPaginadas> {
    let httpParams = new HttpParams()
      .set('offset', params.offset ?? 0)
      .set('limit', params.limit ?? 10)
      .set('orden', params.orden ?? 'fecha');

    if (params.usuarioId) {
      httpParams = httpParams.set('usuarioId', params.usuarioId);
    }

    return this.http.get<PublicacionesPaginadas>(this.baseUrl, { params: httpParams });
  }

  obtenerPorId(id: string): Observable<Publicacion> {
    return this.http.get<Publicacion>(`${this.baseUrl}/${id}`);
  }

  listarComentarios(
    publicacionId: string,
    params: ListarComentariosParams = {},
  ): Observable<ComentariosPaginados> {
    const httpParams = new HttpParams()
      .set('offset', params.offset ?? 0)
      .set('limit', params.limit ?? 5);

    return this.http.get<ComentariosPaginados>(`${this.baseUrl}/${publicacionId}/comentarios`, {
      params: httpParams,
    });
  }

  crearComentario(publicacionId: string, mensaje: string): Observable<Comentario> {
    return this.http.post<Comentario>(`${this.baseUrl}/${publicacionId}/comentarios`, {
      mensaje,
    });
  }

  actualizarComentario(id: string, mensaje: string): Observable<Comentario> {
    return this.http.put<Comentario>(`${environment.apiUrl}/comentarios/${id}`, { mensaje });
  }

  crear(data: CrearPublicacionRequest): Observable<Publicacion> {
    const formData = new FormData();
    formData.append('titulo', data.titulo);
    formData.append('descripcion', data.descripcion);
    if (data.imagen) {
      formData.append('imagen', data.imagen);
    }

    return this.http.post<Publicacion>(this.baseUrl, formData);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  darMeGusta(id: string): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.baseUrl}/${id}/me-gusta`, {});
  }

  quitarMeGusta(id: string): Observable<Publicacion> {
    return this.http.delete<Publicacion>(`${this.baseUrl}/${id}/me-gusta`);
  }

  obtenerPerfil(): Observable<PerfilCompleto> {
    return this.http.get<PerfilCompleto>(`${environment.apiUrl}/auth/perfil`);
  }
}
