import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordStrengthValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value as string;
  if (!value) {
    return null;
  }

  const errors: ValidationErrors = {};

  if (value.length < 8) {
    errors['minLength'] = true;
  }
  if (!/[A-Z]/.test(value)) {
    errors['uppercase'] = true;
  }
  if (!/[0-9]/.test(value)) {
    errors['number'] = true;
  }

  return Object.keys(errors).length ? errors : null;
};

export function getPasswordErrorMessage(errors: ValidationErrors | null): string {
  if (!errors) {
    return '';
  }
  if (errors['required']) {
    return 'La contraseña es obligatoria.';
  }
  if (errors['minLength']) {
    return 'Debe tener al menos 8 caracteres.';
  }
  if (errors['uppercase']) {
    return 'Debe incluir al menos una mayúscula.';
  }
  if (errors['number']) {
    return 'Debe incluir al menos un número.';
  }
  return 'Contraseña inválida.';
}
