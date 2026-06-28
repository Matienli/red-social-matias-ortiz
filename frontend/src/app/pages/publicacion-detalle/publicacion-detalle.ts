import {

  AfterViewInit,

  Component,

  ElementRef,

  inject,

  OnInit,

  signal,

  viewChild,

} from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ActivatedRoute, RouterLink } from '@angular/router';

import { Navbar } from '../../shared/navbar/navbar';

import { PublicacionCard } from '../../components/publicacion-card/publicacion-card';

import { PublicacionesService } from '../../services/publicaciones';

import { AuthService } from '../../services/auth';

import { ModalService } from '../../services/modal';

import { Comentario, Publicacion } from '../../models/publicacion.model';

import { resolveMediaUrl } from '../../utils/media-url';



const LIMITE_COMENTARIOS = 3;



@Component({

  selector: 'app-publicacion-detalle',

  imports: [Navbar, PublicacionCard, RouterLink, ReactiveFormsModule],

  templateUrl: './publicacion-detalle.html',

  styleUrl: './publicacion-detalle.scss',

})

export class PublicacionDetalle implements OnInit, AfterViewInit {

  private readonly route = inject(ActivatedRoute);

  private readonly fb = inject(FormBuilder);

  private readonly publicacionesService = inject(PublicacionesService);

  private readonly auth = inject(AuthService);

  private readonly modal = inject(ModalService);



  private readonly mensajesScroll = viewChild<ElementRef<HTMLElement>>('mensajesScroll');

  private readonly comentarioInput = viewChild<ElementRef<HTMLElement>>('comentarioInput');



  readonly publicacion = signal<Publicacion | null>(null);

  readonly comentarios = signal<Comentario[]>([]);

  readonly cargandoPublicacion = signal(true);

  readonly cargandoComentarios = signal(true);

  readonly cargandoMasComentarios = signal(false);

  readonly enviandoComentario = signal(false);

  readonly hayMasComentarios = signal(false);
  readonly totalComentarios = signal(0);



  readonly comentarioForm = this.fb.nonNullable.group({
    mensaje: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(500)]],
  });

  readonly comentarioEditandoId = signal<string | null>(null);
  readonly guardandoEdicion = signal(false);
  readonly editarComentarioForm = this.fb.nonNullable.group({
    mensaje: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(500)]],
  });



  readonly usuarioActualId = signal<string | null>(this.auth.currentUser()?.id ?? null);

  readonly esAdministrador = signal(

    this.auth.currentUser()?.perfil === 'administrador',

  );



  readonly resolveMediaUrl = resolveMediaUrl;



  private offsetComentarios = 0;

  private debeScrollAlChat = false;



  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.cargandoPublicacion.set(false);
      return;
    }

    this.debeScrollAlChat = this.route.snapshot.fragment === 'comentarios';

    const publicacionEnState = this.obtenerPublicacionDesdeState(id);
    if (publicacionEnState) {
      this.publicacion.set(publicacionEnState);
      this.cargandoPublicacion.set(false);
    }

    this.cargarPublicacion(id, !!publicacionEnState);
    this.cargarComentarios(id);
  }



  ngAfterViewInit(): void {

    if (this.debeScrollAlChat) {

      queueMicrotask(() => this.scrollAlChat());

    }

  }



  scrollAlChat(): void {

    const panel = document.getElementById('comentarios');

    panel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });



    const textarea = this.comentarioInput()?.nativeElement.querySelector('textarea');

    if (textarea instanceof HTMLTextAreaElement) {

      textarea.focus();

    }

  }



  cargarPublicacion(id: string, tieneFallback = false): void {
    if (!this.publicacion()) {
      this.cargandoPublicacion.set(true);
    }

    this.publicacionesService.obtenerPorId(id).subscribe({
      next: (publicacion) => {
        this.publicacion.set(publicacion);
        this.cargandoPublicacion.set(false);
      },
      error: (err) => {
        this.cargandoPublicacion.set(false);
        if (tieneFallback && this.publicacion()) {
          return;
        }
        this.modal.open({
          title: 'Error',
          message: err?.error?.message ?? 'No pudimos cargar la publicación.',
          type: 'error',
        });
      },
    });
  }

  private obtenerPublicacionDesdeState(id: string): Publicacion | null {
    const state = history.state as { publicacion?: Publicacion };
    if (!state?.publicacion || state.publicacion.id !== id) {
      return null;
    }
    return state.publicacion;
  }



  cargarComentarios(id: string): void {

    this.cargandoComentarios.set(true);

    this.offsetComentarios = 0;



    this.publicacionesService

      .listarComentarios(id, { offset: 0, limit: LIMITE_COMENTARIOS })

      .subscribe({

        next: (respuesta) => {

          this.comentarios.set(this.ordenarComentariosParaVista(respuesta.datos));
          this.offsetComentarios = respuesta.datos.length;
          this.totalComentarios.set(respuesta.total);
          this.hayMasComentarios.set(this.offsetComentarios < respuesta.total);

          this.cargandoComentarios.set(false);

          if (!this.hayMasComentarios()) {

            queueMicrotask(() => this.scrollAlFinal());

          }

        },

        error: () => {

          this.cargandoComentarios.set(false);

          this.modal.open({

            title: 'Error',

            message: 'No pudimos cargar los comentarios.',

            type: 'error',

          });

        },

      });

  }



  cargarMasComentarios(): void {

    const publicacion = this.publicacion();

    if (!publicacion || this.cargandoMasComentarios() || !this.hayMasComentarios()) {

      return;

    }



    const contenedor = this.mensajesScroll()?.nativeElement;

    const scrollPrevio = contenedor?.scrollHeight ?? 0;



    this.cargandoMasComentarios.set(true);

    const restantes = this.totalComentarios() - this.offsetComentarios;

    this.publicacionesService
      .listarComentarios(publicacion.id, {
        offset: this.offsetComentarios,
        limit: restantes,
      })
      .subscribe({
        next: (respuesta) => {
          const masViejos = this.ordenarComentariosParaVista(respuesta.datos);
          this.comentarios.update((actuales) => [...masViejos, ...actuales]);
          this.offsetComentarios = this.totalComentarios();
          this.hayMasComentarios.set(false);

          this.cargandoMasComentarios.set(false);



          queueMicrotask(() => {

            if (contenedor) {

              contenedor.scrollTop += contenedor.scrollHeight - scrollPrevio;

            }

          });

        },

        error: () => {

          this.cargandoMasComentarios.set(false);

          this.modal.open({

            title: 'Error',

            message: 'No pudimos cargar más comentarios.',

            type: 'error',

          });

        },

      });

  }



  onMeGusta(publicacion: Publicacion): void {

    const peticion = publicacion.meGustaPorMi

      ? this.publicacionesService.quitarMeGusta(publicacion.id)

      : this.publicacionesService.darMeGusta(publicacion.id);



    peticion.subscribe({

      next: (actualizada) => {

        this.publicacion.set(actualizada);

      },

      error: (err) => {

        this.modal.open({

          title: 'Error',

          message: err?.error?.message ?? 'No pudimos actualizar el me gusta.',

          type: 'error',

        });

      },

    });

  }



  enviarComentario(): void {

    const publicacion = this.publicacion();

    if (!publicacion || this.comentarioForm.invalid) {

      this.comentarioForm.markAllAsTouched();

      return;

    }



    const mensaje = this.comentarioForm.controls.mensaje.value.trim();

    if (!mensaje) {

      return;

    }



    this.enviandoComentario.set(true);



    this.publicacionesService.crearComentario(publicacion.id, mensaje).subscribe({

      next: (comentario) => {

        this.comentarios.update((actuales) => [...actuales, comentario]);
        this.totalComentarios.update((total) => total + 1);
        this.comentarioForm.reset();

        this.enviandoComentario.set(false);

        queueMicrotask(() => this.scrollAlFinal());

      },

      error: (err) => {

        this.enviandoComentario.set(false);

        this.modal.open({

          title: 'Error',

          message: err?.error?.message ?? 'No pudimos publicar el comentario.',

          type: 'error',

        });

      },

    });

  }



  onEliminar(id: string): void {

    this.publicacionesService.eliminar(id).subscribe({

      next: () => {

        this.publicacion.set(null);

        this.modal.open({

          title: 'Publicación eliminada',

          message: 'La publicación fue dada de baja.',

          type: 'info',

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



  private scrollAlFinal(): void {
    const contenedor = this.mensajesScroll()?.nativeElement;
    if (contenedor) {
      contenedor.scrollTop = contenedor.scrollHeight;
    }
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
        this.comentarios.update((lista) =>
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

  private ordenarComentariosParaVista(datos: Comentario[]): Comentario[] {

    return [...datos].reverse();

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

