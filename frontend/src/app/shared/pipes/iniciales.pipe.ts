import { Pipe, PipeTransform } from '@angular/core';

export interface InicialesEntrada {
  nombre?: string;
  apellido?: string;
}

@Pipe({
  name: 'iniciales',
  standalone: true,
})
export class InicialesPipe implements PipeTransform {
  transform(valor: InicialesEntrada | string | null | undefined): string {
    if (!valor) {
      return '';
    }

    if (typeof valor === 'string') {
      const partes = valor.trim().split(/\s+/).filter(Boolean);
      if (partes.length >= 2) {
        return `${partes[0].charAt(0)}${partes[1].charAt(0)}`.toUpperCase();
      }
      return partes[0]?.charAt(0).toUpperCase() ?? '';
    }

    const nombre = valor.nombre?.charAt(0) ?? '';
    const apellido = valor.apellido?.charAt(0) ?? '';
    return `${nombre}${apellido}`.toUpperCase();
  }
}
