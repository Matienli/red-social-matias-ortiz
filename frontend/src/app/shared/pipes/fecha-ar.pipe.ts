import { Pipe, PipeTransform } from '@angular/core';

export type FechaArModo = 'fecha' | 'fechaHora';

@Pipe({
  name: 'fechaAR',
  standalone: true,
})
export class FechaArPipe implements PipeTransform {
  transform(
    fecha: string | Date | null | undefined,
    modo: FechaArModo = 'fechaHora',
  ): string {
    if (!fecha) {
      return '';
    }

    if (typeof fecha === 'string') {
      const soloFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
      if (soloFecha) {
        const [, anio, mes, dia] = soloFecha;
        if (modo === 'fecha') {
          return `${dia}/${mes}/${anio}`;
        }
      }
    }

    const opciones: Intl.DateTimeFormatOptions =
      modo === 'fecha'
        ? { day: '2-digit', month: '2-digit', year: 'numeric' }
        : {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          };

    return new Date(fecha).toLocaleString('es-AR', opciones);
  }
}
