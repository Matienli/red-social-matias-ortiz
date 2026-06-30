import { Component, inject, input, output, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router, RouterLink } from '@angular/router';

import { Comentario, Publicacion } from '../../models/publicacion.model';

import { ImageViewerService } from '../../services/image-viewer';

import { ModalService } from '../../services/modal';

import { PublicacionesService } from '../../services/publicaciones';

import { resolveMediaUrl } from '../../utils/media-url';

import { FechaArPipe } from '../../shared/pipes/fecha-ar.pipe';

import { InicialesPipe } from '../../shared/pipes/iniciales.pipe';

import { NombreUsuarioPipe } from '../../shared/pipes/nombre-usuario.pipe';

import { finalize } from 'rxjs';



const PREVIEW_LIMITE = 3;



@Component({

  selector: 'app-publicacion-card',

  imports: [RouterLink, ReactiveFormsModule, FechaArPipe, InicialesPipe, NombreUsuarioPipe],

  templateUrl: './publicacion-card.html',

  styleUrl: './publicacion-card.scss',

})

export class PublicacionCard {

  private readonly imageViewer = inject(ImageViewerService);

  private readonly fb = inject(FormBuilder);

  private readonly publicacionesService = inject(PublicacionesService);

  private readonly modal = inject(ModalService);
  private readonly router = inject(Router);



  readonly publicacion = input.required<Publicacion>();

  readonly usuarioActualId = input<string | null>(null);

  readonly esAdministrador = input(false);

  readonly mostrarComentarios = input(false);

  readonly comentariosExpandibles = input(true);

  readonly imagenExpandible = input(false);



  readonly meGustaCambiado = output<Publicacion>();

  readonly eliminarSolicitado = output<string>();

  readonly enfocarComentarios = output<void>();



  readonly comentariosExpandidos = signal(false);

  readonly comentariosPreview = signal<Comentario[]>([]);

  readonly totalComentarios = signal<number | null>(null);

  readonly cargandoComentariosPreview = signal(false);

  readonly enviandoComentarioPreview = signal(false);



  readonly miniComentarioForm = this.fb.nonNullable.group({
    mensaje: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(500)]],
  });

  readonly comentarioEditandoId = signal<string | null>(null);
  readonly guardandoEdicion = signal(false);
  readonly editarComentarioForm = this.fb.nonNullable.group({
    mensaje: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(500)]],
  });



  readonly resolveMediaUrl = resolveMediaUrl;

  readonly previewLimite = PREVIEW_LIMITE;



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



  abrirImagen(url: string): void {
    if (!this.imagenExpandible()) {
      return;
    }
    this.imageViewer.open(url, this.publicacion().titulo);
  }

  irADetalle(event: Event, fragment?: string): void {
    event.preventDefault();
    void this.router.navigate(['/publicaciones', this.publicacion().id], {
      fragment,
      state: { publicacion: this.publicacion() },
    });
  }

  toggleComentarios(): void {
    if (!this.comentariosExpandibles()) {
      if (this.mostrarComentarios()) {
        void this.router.navigate(['/publicaciones', this.publicacion().id], {
          fragment: 'comentarios',
          state: { publicacion: this.publicacion() },
        });
      } else {
        this.enfocarComentarios.emit();
      }
      return;
    }

    const expandir = !this.comentariosExpandidos();

    this.comentariosExpandidos.set(expandir);



    if (expandir && !this.comentariosPreview().length && !this.cargandoComentariosPreview()) {

      this.cargarComentariosPreview();

    }

  }



  cargarComentariosPreview(): void {

    this.cargandoComentariosPreview.set(true);



    this.publicacionesService

      .listarComentarios(this.publicacion().id, { offset: 0, limit: PREVIEW_LIMITE })

      .pipe(finalize(() => this.cargandoComentariosPreview.set(false)))

      .subscribe({

        next: (respuesta) => {

          this.comentariosPreview.set(this.ordenarComentariosPreview(respuesta.datos));

          this.totalComentarios.set(respuesta.total);

        },

        error: () => {

          const comentarios = this.publicacion().comentarios;
          if (comentarios?.length) {
            this.comentariosPreview.set(this.ordenarComentariosPreview(comentarios.slice(-PREVIEW_LIMITE)));
            this.totalComentarios.set(comentarios.length);
            return;
          }

          this.modal.open({

            title: 'Error',

            message: 'No pudimos cargar los comentarios.',

            type: 'error',

          });

        },

      });

  }

  private ordenarComentariosPreview(datos: Comentario[] | undefined): Comentario[] {
    if (!datos?.length) {
      return [];
    }
    return [...datos].reverse();
  }



  enviarComentarioPreview(): void {

    if (this.miniComentarioForm.invalid) {

      this.miniComentarioForm.markAllAsTouched();

      return;

    }



    const mensaje = this.miniComentarioForm.controls.mensaje.value.trim();

    if (!mensaje) {

      return;

    }



    this.enviandoComentarioPreview.set(true);



    this.publicacionesService.crearComentario(this.publicacion().id, mensaje).subscribe({

      next: (comentario) => {

        this.comentariosPreview.update((actuales) => {

          const actualizados = [...actuales, comentario];

          return actualizados.length > PREVIEW_LIMITE

            ? actualizados.slice(-PREVIEW_LIMITE)

            : actualizados;

        });

        this.totalComentarios.update((total) => (total ?? 0) + 1);

        this.miniComentarioForm.reset();

        this.enviandoComentarioPreview.set(false);

      },

      error: (err) => {

        this.enviandoComentarioPreview.set(false);

        this.modal.open({

          title: 'Error',

          message: err?.error?.message ?? 'No pudimos publicar el comentario.',

          type: 'error',

        });

      },

    });

  }



  cantidadComentariosDisplay(): number | null {
    const total = this.totalComentarios();
    if (total !== null) {
      return total;
    }

    const comentarios = this.publicacion().comentarios;
    return comentarios ? comentarios.length : null;
  }

  esComentarioPropio(comentario: Comentario): boolean {
    const usuarioId = this.usuarioActualId();
    return !!usuarioId && comentario.autor.id === usuarioId;
  }

  iniciarEdicion(comentario: Comentario): void {
    this.comentarioEditandoId.set(comentario.id);
    this.editarComentarioForm.setValue({ mensaje: comentario.mensaje });
  }

  cancelarEdicion(): void {
    this.comentarioEditandoId.set(null);
    this.editarComentarioForm.reset();
  }

  guardarEdicion(comentarioId: string): void {
    if (this.editarComentarioForm.invalid) {
      this.editarComentarioForm.markAllAsTouched();
      return;
    }

    const mensaje = this.editarComentarioForm.controls.mensaje.value.trim();
    if (!mensaje) {
      return;
    }

    this.guardandoEdicion.set(true);

    this.publicacionesService.actualizarComentario(comentarioId, mensaje).subscribe({
      next: (actualizado) => {
        this.comentariosPreview.update((lista) =>
          lista.map((c) => (c.id === comentarioId ? actualizado : c)),
        );
        this.cancelarEdicion();
        this.guardandoEdicion.set(false);
      },
      error: (err) => {
        this.guardandoEdicion.set(false);
        this.modal.open({
          title: 'Error',
          message: err?.error?.message ?? 'No pudimos guardar los cambios.',
          type: 'error',
        });
      },
    });
  }
}

