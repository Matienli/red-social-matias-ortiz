import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombreUsuario',
  standalone: true,
})
export class NombreUsuarioPipe implements PipeTransform {
  transform(usuario: string | null | undefined): string {
    if (!usuario) {
      return '';
    }

    const limpio = usuario.startsWith('@') ? usuario.slice(1) : usuario;
    return `@${limpio}`;
  }
}
