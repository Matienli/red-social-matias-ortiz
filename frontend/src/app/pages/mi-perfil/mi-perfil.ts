import { Component, inject, OnInit, signal } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { PublicacionCard } from '../../components/publicacion-card/publicacion-card';
import { PublicacionesService } from '../../services/publicaciones';
import { ModalService } from '../../services/modal';
import { AuthService } from '../../services/auth';
import { PerfilCompleto } from '../../models/publicacion.model';
import { resolveMediaUrl } from '../../utils/media-url';
import { FechaArPipe } from '../../shared/pipes/fecha-ar.pipe';
import { InicialesPipe } from '../../shared/pipes/iniciales.pipe';
import { NombreUsuarioPipe } from '../../shared/pipes/nombre-usuario.pipe';

@Component({
  selector: 'app-mi-perfil',
  imports: [Navbar, PublicacionCard, FechaArPipe, InicialesPipe, NombreUsuarioPipe],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss',
})
export class MiPerfil implements OnInit {
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly modal = inject(ModalService);
  private readonly auth = inject(AuthService);

  readonly perfil = signal<PerfilCompleto | null>(null);
  readonly cargando = signal(true);
  readonly esAdministrador = signal(
    this.auth.currentUser()?.perfil === 'administrador',
  );
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

  onEliminar(publicacionId: string): void {
    this.publicacionesService.eliminar(publicacionId).subscribe({
      next: () => {
        this.perfil.update((actual) => {
          if (!actual) {
            return actual;
          }
          return {
            ...actual,
            ultimasPublicaciones: actual.ultimasPublicaciones.filter((p) => p.id !== publicacionId),
          };
        });
        this.modal.open({
          title: 'Publicación eliminada',
          message: 'La publicación y sus comentarios ya no están disponibles.',
          type: 'success',
        });
      },
      error: (err) => {
        this.modal.open({
          title: 'Error',
          message: err?.error?.message ?? 'No pudimos eliminar la publicación.',
          type: 'error',
        });
      },
    });
  }
}
