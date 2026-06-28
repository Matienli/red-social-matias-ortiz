import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { LoadingScreen } from '../../shared/loading-screen/loading-screen';

@Component({
  selector: 'app-cargando',
  imports: [LoadingScreen],
  templateUrl: './cargando.html',
})
export class Cargando implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (!this.auth.tieneTokenAlmacenado()) {
      void this.router.navigate(['/login']);
      return;
    }

    this.auth.validarSesionConServidor().subscribe({
      next: (valida) => {
        void this.router.navigate(valida ? ['/publicaciones'] : ['/login']);
      },
      error: () => {
        void this.router.navigate(['/login']);
      },
    });
  }
}
