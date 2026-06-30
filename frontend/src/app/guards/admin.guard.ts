import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.hasValidSession()) {
    return router.createUrlTree(['/login']);
  }

  if (auth.currentUser()?.perfil === 'administrador') {
    return true;
  }

  return router.createUrlTree(['/publicaciones']);
};
