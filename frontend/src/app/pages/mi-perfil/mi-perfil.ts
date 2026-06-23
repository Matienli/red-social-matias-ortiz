import { Component, inject, OnInit, signal } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { PublicacionCard } from '../../components/publicacion-card/publicacion-card';
import { PublicacionesService } from '../../services/publicaciones';
import { ModalService } from '../../services/modal';
import { PerfilCompleto } from '../../models/publicacion.model';
import { resolveMediaUrl } from '../../utils/media-url';

@Component({
  selector: 'app-mi-perfil',
  imports: [Navbar, PublicacionCard],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss',
})
export class MiPerfil implements OnInit {
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly modal = inject(ModalService);

  readonly perfil = signal<PerfilCompleto | null>(null);
  readonly cargando = signal(true);
  readonly resolveMediaUrl = resolveMediaUrl;

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.cargando.set(true);
    this.publicacionesService.obtenerPerfil().subscribe({
      next: (datos) => {
        this.perfil.set(datos);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.modal.open({
          title: 'Error',
          message: 'No pudimos cargar tu perfil.',
          type: 'error',
        });
      },
    });
  }

  formatFecha(fecha: string): string {
    const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha);
    if (iso) {
      return `${iso[3]}/${iso[2]}/${iso[1]}`;
    }
    return fecha;
  }
}
