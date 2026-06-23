import { Component, input, output } from '@angular/core';
import { Publicacion } from '../../models/publicacion.model';
import { resolveMediaUrl } from '../../utils/media-url';

@Component({
  selector: 'app-publicacion-card',
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.scss',
})
export class PublicacionCard {
  readonly publicacion = input.required<Publicacion>();
  readonly usuarioActualId = input<string | null>(null);
  readonly esAdministrador = input(false);
  readonly mostrarComentarios = input(false);

  readonly meGustaCambiado = output<Publicacion>();
  readonly eliminarSolicitado = output<string>();

  readonly resolveMediaUrl = resolveMediaUrl;

  puedeEliminar(): boolean {
    return this.esPropia() || this.esAdministrador();
  }

  esPropia(): boolean {
    const usuarioId = this.usuarioActualId();
    return !!usuarioId && this.publicacion().autor.id === usuarioId;
  }

  cambiarMeGusta(): void {
    this.meGustaCambiado.emit(this.publicacion());
  }

  eliminar(): void {
    this.eliminarSolicitado.emit(this.publicacion().id);
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
