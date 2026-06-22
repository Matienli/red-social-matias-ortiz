import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { AuthService } from '../../services/auth';
import { ModalService } from '../../services/modal';
import {
  getPasswordErrorMessage,
  passwordStrengthValidator,
} from '../../validators/password.validators';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Navbar],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly modal = inject(ModalService);
  private readonly router = inject(Router);

  readonly submitted = { value: false };
  loading = false;

  readonly form = this.fb.nonNullable.group({
    identificador: ['', [Validators.required, Validators.minLength(3)]],
    contrasena: ['', [Validators.required, passwordStrengthValidator]],
  });

  getPasswordErrorMessage = getPasswordErrorMessage;

  isInvalid(controlName: 'identificador' | 'contrasena'): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitted.value);
  }

  getIdentificadorError(): string {
    const control = this.form.get('identificador');
    if (!control?.errors) {
      return '';
    }
    if (control.errors['required']) {
      return 'Ingresá tu correo o nombre de usuario.';
    }
    if (control.errors['minlength']) {
      return 'Debe tener al menos 3 caracteres.';
    }
    return 'Identificador inválido.';
  }

  onSubmit(): void {
    this.submitted.value = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.modal.open({
          title: '¡Bienvenido!',
          message: 'Iniciaste sesión correctamente.',
          type: 'success',
        });
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        this.loading = false;
        const message =
          err?.error?.message ??
          'No pudimos iniciar sesión. Verificá tus datos o intentá más tarde.';
        this.modal.open({
          title: 'Error al iniciar sesión',
          message,
          type: 'error',
        });
      },
    });
  }
}
