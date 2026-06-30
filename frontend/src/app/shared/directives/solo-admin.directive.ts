import { Directive, ElementRef, inject, OnInit, Renderer2 } from '@angular/core';
import { AuthService } from '../../services/auth';

@Directive({
  selector: '[appSoloAdmin]',
  standalone: true,
})
export class SoloAdminDirective implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  ngOnInit(): void {
    if (this.auth.currentUser()?.perfil !== 'administrador') {
      this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
    }
  }
}
