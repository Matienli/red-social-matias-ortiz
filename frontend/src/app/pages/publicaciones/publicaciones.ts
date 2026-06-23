import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Navbar } from '../../shared/navbar/navbar';
import { PublicacionCard } from '../../components/publicacion-card/publicacion-card';
import { PublicacionesService } from '../../services/publicaciones';
import { AuthService } from '../../services/auth';
import { ModalService } from '../../services/modal';
import { OrdenPublicaciones, Publicacion } from '../../models/publicacion.model';

const LIMITE_POR_PAGINA = 5;

@Component({
  selector: 'app-publicaciones',
  imports: [Navbar, PublicacionCard, ReactiveFormsModule],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.scss',
})
export class Publicaciones implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly auth = inject(AuthService);
  private readonly modal = inject(ModalService);

  readonly publicaciones = signal<Publicacion[]>([]);
  readonly pagina = signal(1);
  readonly totalPaginas = signal(1);
  readonly orden = signal<OrdenPublicaciones>('fecha');
  readonly cargando = signal(false);
  readonly creando = signal(false);
  readonly mostrarFormulario = signal(false);

  readonly usuarioActualId = signal<string | null>(this.auth.currentUser()?.id ?? null);
  readonly esAdministrador = signal(
    this.auth.currentUser()?.perfil === 'administrador',
  );

  readonly form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    descripcion: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(2000)]],
  });

  imagenArchivo: File | null = null;
  imagenPreview: string | null = null;

  ngOnInit(): void {
    this.cargarPublicaciones();
  }

  cargarPublicaciones(): void {
    this.cargando.set(true);
    const offset = (this.pagina() - 1) * LIMITE_POR_PAGINA;

    this.publicacionesService
      .listar({ offset, limit: LIMITE_POR_PAGINA, orden: this.orden() })
      .subscribe({
        next: (respuesta) => {
          this.publicaciones.set(respuesta.datos);
          this.pagina.set(Math.floor(respuesta.offset / respuesta.limit) + 1);
          this.totalPaginas.set(Math.max(1, Math.ceil(respuesta.total / respuesta.limit)));
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
          this.modal.open({
            title: 'Error',
            message: 'No pudimos cargar las publicaciones.',
            type: 'error',
          });
        },
      });
  }

  cambiarOrden(orden: OrdenPublicaciones): void {
    if (this.orden() === orden) {
      return;
    }
    this.orden.set(orden);
    this.pagina.set(1);
    this.cargarPublicaciones();
  }

  paginaAnterior(): void {
    if (this.pagina() <= 1) {
      return;
    }
    this.pagina.update((valor) => valor - 1);
    this.cargarPublicaciones();
  }

  paginaSiguiente(): void {
    if (this.pagina() >= this.totalPaginas()) {
      return;
    }
    this.pagina.update((valor) => valor + 1);
    this.cargarPublicaciones();
  }

  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      this.imagenArchivo = null;
      this.imagenPreview = null;
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.modal.open({
        title: 'Archivo inválido',
        message: 'La imagen debe ser JPG, PNG u otro formato de imagen.',
        type: 'error',
      });
      input.value = '';
      return;
    }

    this.imagenArchivo = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  crearPublicacion(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.creando.set(true);

    this.publicacionesService
      .crear({
        titulo: raw.titulo,
        descripcion: raw.descripcion,
        imagen: this.imagenArchivo ?? undefined,
      })
      .subscribe({
        next: () => {
          this.creando.set(false);
          this.form.reset();
          this.imagenArchivo = null;
          this.imagenPreview = null;
          this.mostrarFormulario.set(false);
          this.pagina.set(1);
          this.orden.set('fecha');
          this.cargarPublicaciones();
          this.modal.open({
            title: 'Publicación creada',
            message: 'Tu publicación se publicó correctamente.',
            type: 'success',
          });
        },
        error: (err) => {
          this.creando.set(false);
          this.modal.open({
            title: 'Error',
            message: err?.error?.message ?? 'No pudimos crear la publicación.',
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
        this.publicaciones.update((lista) =>
          lista.map((item) => (item.id === actualizada.id ? actualizada : item)),
        );
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

  onEliminar(id: string): void {
    this.publicacionesService.eliminar(id).subscribe({
      next: () => {
        this.cargarPublicaciones();
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
}
