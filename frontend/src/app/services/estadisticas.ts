import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ComentariosPorDiaEstadistica,
  ComentariosPorPublicacionEstadistica,
  PublicacionesPorUsuarioEstadistica,
  RangoFechasParams,
} from '../models/estadisticas.model';

@Injectable({
  providedIn: 'root',
})
export class EstadisticasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/estadisticas`;

  publicacionesPorUsuario(
    params: RangoFechasParams = {},
  ): Observable<{ datos: PublicacionesPorUsuarioEstadistica[]; total: number }> {
    return this.http.get<{ datos: PublicacionesPorUsuarioEstadistica[]; total: number }>(
      `${this.baseUrl}/publicaciones-por-usuario`,
      { params: this.buildParams(params) },
    );
  }

  comentarios(
    params: RangoFechasParams = {},
  ): Observable<{ total: number; porDia: ComentariosPorDiaEstadistica[] }> {
    return this.http.get<{ total: number; porDia: ComentariosPorDiaEstadistica[] }>(
      `${this.baseUrl}/comentarios`,
      { params: this.buildParams(params) },
    );
  }

  comentariosPorPublicacion(
    params: RangoFechasParams = {},
  ): Observable<{ datos: ComentariosPorPublicacionEstadistica[]; total: number }> {
    return this.http.get<{ datos: ComentariosPorPublicacionEstadistica[]; total: number }>(
      `${this.baseUrl}/comentarios-por-publicacion`,
      { params: this.buildParams(params) },
    );
  }

  private buildParams(params: RangoFechasParams): HttpParams {
    let httpParams = new HttpParams();
    if (params.desde) {
      httpParams = httpParams.set('desde', params.desde);
    }
    if (params.hasta) {
      httpParams = httpParams.set('hasta', params.hasta);
    }
    return httpParams;
  }
}
