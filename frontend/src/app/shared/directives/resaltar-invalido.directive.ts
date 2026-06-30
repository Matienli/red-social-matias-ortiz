import { Directive, HostBinding, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[formControlName][appResaltarInvalido], [formControl][appResaltarInvalido]',
  standalone: true,
})
export class ResaltarInvalidoDirective {
  private readonly ngControl = inject(NgControl);

  @HostBinding('class.invalid')
  get mostrarInvalido(): boolean {
    const control = this.ngControl.control;
    return !!control && control.invalid && (control.touched || control.dirty);
  }
}
