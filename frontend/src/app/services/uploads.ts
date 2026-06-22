import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ImagenSubida {
  url: string;
  publicId: string;
  formato: string;
}

export interface UploadResponse {
  mensaje: string;
  datos: ImagenSubida;
}

@Injectable({
  providedIn: 'root',
})
export class UploadsService {
  private readonly apiUrl = `${environment.apiUrl}/uploads/upload`;

  constructor(private readonly http: HttpClient) {}

  subirImagen(archivo: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', archivo);

    return this.http.post<UploadResponse>(this.apiUrl, formData);
  }
}
