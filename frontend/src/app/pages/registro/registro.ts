import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { LoadingScreen } from '../../shared/loading-screen/loading-screen';
import { AuthService } from '../../services/auth';
import { ModalService } from '../../services/modal';
import { PerfilUsuario } from '../../models/user.model';
import {
  getPasswordErrorMessage,
  passwordStrengthValidator,
} from '../../validators/password.validators';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const contrasena = control.get('contrasena')?.value;
  const repetir = control.get('repetirContrasena')?.value;
  if (!contrasena || !repetir) {
    return null;
  }
  return contrasena === repetir ? null : { passwordMismatch: true };
}

function fechaNacimientoValidator(control: AbstractControl): ValidationErrors | null {
  const value = (control.value as string)?.trim();
  if (!value) {
    return null;
  }

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) {
    return { fechaInvalida: true };
  }

  const dia = Number(match[1]);
  const mes = Number(match[2]);
  const anio = Number(match[3]);
  const fecha = new Date(anio, mes - 1, dia);

  if (
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    return { fechaInvalida: true };
  }

  if (fecha > new Date()) {
    return { fechaFutura: true };
  }

  return null;
}

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, Navbar, LoadingScreen],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly modal = inject(ModalService);
  private readonly router = inject(Router);

  readonly submitted = { value: false };
  loading = false;
  imagenPreview: string | null = null;
  imagenArchivo: File | null = null;
  mostrarContrasena = false;
  mostrarRepetirContrasena = false;

  readonly perfiles: { value: PerfilUsuario; label: string }[] = [
    { value: 'usuario', label: 'Usuario' },
    { value: 'administrador', label: 'Administrador' },
  ];

  readonly form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-Z0-9_.]+$/),
        ],
      ],
      contrasena: ['', [Validators.required, passwordStrengthValidator]],
      repetirContrasena: ['', [Validators.required]],
      fechaNacimiento: [
        '',
        [Validators.required, fechaNacimientoValidator],
      ],
      descripcionBreve: ['', [Validators.required, Validators.maxLength(200)]],
      perfil: ['usuario' as PerfilUsuario, [Validators.required]],
    },
    { validators: passwordsMatchValidator },
  );

  getPasswordErrorMessage = getPasswordErrorMessage;

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitted.value);
  }

  hasPasswordMismatch(): boolean {
    return (
      (this.form.get('repetirContrasena')?.touched || this.submitted.value) &&
      !!this.form.errors?.['passwordMismatch']
    );
  }

  getFieldError(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control?.errors) {
      return '';
    }
    const errors = control.errors;
    if (errors['required']) {
      return 'Este campo es obligatorio.';
    }
    if (errors['email']) {
      return 'Ingresá un correo válido.';
    }
    if (errors['minlength']) {
      return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres.`;
    }
    if (errors['maxlength']) {
      return `No puede superar ${errors['maxlength'].requiredLength} caracteres.`;
    }
    if (errors['pattern']) {
      return 'Solo letras, números, punto y guión bajo.';
    }
    if (errors['fechaInvalida']) {
      return 'Ingresá una fecha válida en formato dd/mm/aaaa.';
    }
    if (errors['fechaFutura']) {
      return 'La fecha de nacimiento no puede ser futura.';
    }
    return 'Valor inválido.';
  }

  onFechaNacimientoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const soloNumeros = input.value.replace(/\D/g, '').slice(0, 8);

    let formateada = soloNumeros;
    if (soloNumeros.length > 4) {
      formateada = `${soloNumeros.slice(0, 2)}/${soloNumeros.slice(2, 4)}/${soloNumeros.slice(4)}`;
    } else if (soloNumeros.length > 2) {
      formateada = `${soloNumeros.slice(0, 2)}/${soloNumeros.slice(2)}`;
    }

    input.value = formateada;
    this.form.controls.fechaNacimiento.setValue(formateada, { emitEvent: false });
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
        message: 'La imagen de perfil debe ser un archivo de imagen (JPG, PNG, etc.).',
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

  onSubmit(): void {
    this.submitted.value = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.loading = true;

    this.auth
      .register({
        nombre: raw.nombre,
        apellido: raw.apellido,
        correo: raw.correo,
        nombreUsuario: raw.nombreUsuario,
        contrasena: raw.contrasena,
        fechaNacimiento: raw.fechaNacimiento,
        descripcionBreve: raw.descripcionBreve,
        perfil: raw.perfil,
        imagenPerfil: this.imagenArchivo ?? undefined,
      })
      .subscribe({
        next: () => {
          void this.router.navigate(['/publicaciones']);
        },
        error: (err) => {
          this.loading = false;
          const message =
            err?.error?.message ??
            'No pudimos completar el registro. Revisá los datos o intentá más tarde.';
          this.modal.open({
            title: 'Error en el registro',
            message,
            type: 'error',
          });
        },
      });
  }
}
