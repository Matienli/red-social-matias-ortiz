import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ModalService } from '../../services/modal';
import { NombreUsuarioPipe } from '../pipes/nombre-usuario.pipe';
import { SoloAdminDirective } from '../directives/solo-admin.directive';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NombreUsuarioPipe, SoloAdminDirective],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private readonly auth = inject(AuthService);
  private readonly modal = inject(ModalService);
  private readonly router = inject(Router);

  readonly currentUser = this.auth.currentUser;
  readonly isAuthenticated = this.auth.isAuthenticated;

  logout(): void {
    this.auth.logout();
    this.modal.open({
      title: 'Sesión cerrada',
      message: 'Cerraste sesión correctamente.',
      type: 'info',
    });
    this.router.navigate(['/login']);
  }
}
