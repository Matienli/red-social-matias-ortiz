import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-cargando',
  templateUrl: './cargando.html',
  styleUrl: './cargando.scss',
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
    });
  }
}
