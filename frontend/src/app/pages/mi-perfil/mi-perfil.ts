import { Component, inject } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { AuthService } from '../../services/auth';
import { resolveMediaUrl } from '../../utils/media-url';

@Component({
  selector: 'app-mi-perfil',
  imports: [Navbar],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss',
})
export class MiPerfil {
  private readonly auth = inject(AuthService);
  readonly currentUser = this.auth.currentUser;
  readonly resolveMediaUrl = resolveMediaUrl;

  formatFecha(fecha: string): string {
    const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha);
    if (iso) {
      return `${iso[3]}/${iso[2]}/${iso[1]}`;
    }
    return fecha;
  }
}
