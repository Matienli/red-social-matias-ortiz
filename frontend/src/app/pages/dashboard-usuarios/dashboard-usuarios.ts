import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { UsuariosService } from '../../services/usuarios';
import { ModalService } from '../../services/modal';
import { PerfilUsuario, UsuarioListado } from '../../models/user.model';
import {
  getPasswordErrorMessage,
  passwordStrengthValidator,
} from '../../validators/password.validators';

@Component({
  selector: 'app-dashboard-usuarios',
  imports: [Navbar, ReactiveFormsModule, RouterLink],
  templateUrl: './dashboard-usuarios.html',
  styleUrl: './dashboard-usuarios.scss',
})
export class DashboardUsuarios implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuariosService = inject(UsuariosService);
  private readonly modal = inject(ModalService);

  readonly usuarios = signal<UsuarioListado[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly mostrarFormulario = signal(false);
  readonly submitted = { value: false };

  readonly perfiles: { value: PerfilUsuario; label: string }[] = [
    { value: 'usuario', label: 'Usuario' },
    { value: 'administrador', label: 'Administrador' },
  ];

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    correo: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    contrasena: ['', [Validators.required, passwordStrengthValidator]],
    fechaNacimiento: ['', [Validators.required]],
    descripcionBreve: ['', [Validators.required, Validators.maxLength(200)]],
    perfil: ['usuario' as PerfilUsuario, Validators.required],
  });

  getPasswordErrorMessage = getPasswordErrorMessage;

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.usuariosService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.modal.open({
          title: 'Error',
          message: 'No pudimos cargar los usuarios.',
          type: 'error',
        });
      },
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario.update((v) => !v);
    if (!this.mostrarFormulario()) {
      this.form.reset({ perfil: 'usuario' });
      this.submitted.value = false;
    }
  }

  isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitted.value);
  }

  onSubmit(): void {
    this.submitted.value = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.usuariosService.crear(this.form.getRawValue()).subscribe({
      next: (usuario) => {
        this.usuarios.update((lista) => [usuario, ...lista]);
        this.guardando.set(false);
        this.toggleFormulario();
        this.modal.open({
          title: 'Usuario creado',
          message: `Se registró a @${usuario.nombreUsuario} correctamente.`,
          type: 'success',
        });
      },
      error: (err) => {
        this.guardando.set(false);
        this.modal.open({
          title: 'Error',
          message: err?.error?.message ?? 'No pudimos crear el usuario.',
          type: 'error',
        });
      },
    });
  }

  async deshabilitar(usuario: UsuarioListado): Promise<void> {
    const confirmar = await this.modal.confirm({
      title: 'Deshabilitar usuario',
      message: `¿Deshabilitar a @${usuario.nombreUsuario}? No podrá ingresar.`,
      type: 'info',
      confirmLabel: 'Sí, deshabilitar',
      cancelLabel: 'Cancelar',
    });
    if (!confirmar) {
      return;
    }

    this.usuariosService.deshabilitar(usuario.id).subscribe({
      next: (actualizado) => this.actualizarEnLista(actualizado),
      error: (err) => {
        this.modal.open({
          title: 'Error',
          message: err?.error?.message ?? 'No pudimos deshabilitar el usuario.',
          type: 'error',
        });
      },
    });
  }

  rehabilitar(usuario: UsuarioListado): void {
    this.usuariosService.rehabilitar(usuario.id).subscribe({
      next: (actualizado) => this.actualizarEnLista(actualizado),
      error: (err) => {
        this.modal.open({
          title: 'Error',
          message: err?.error?.message ?? 'No pudimos rehabilitar el usuario.',
          type: 'error',
        });
      },
    });
  }

  private actualizarEnLista(actualizado: UsuarioListado): void {
    this.usuarios.update((lista) =>
      lista.map((u) => (u.id === actualizado.id ? actualizado : u)),
    );
  }
}
