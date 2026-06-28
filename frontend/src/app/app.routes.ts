import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Publicaciones } from './pages/publicaciones/publicaciones';
import { MiPerfil } from './pages/mi-perfil/mi-perfil';
import { PublicacionDetalle } from './pages/publicacion-detalle/publicacion-detalle';
import { Cargando } from './pages/cargando/cargando';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'cargando', pathMatch: 'full' },
  {
    path: 'cargando',
    component: Cargando,
    title: 'Cargando | Red Social',
  },
  {
    path: 'login',
    component: Login,
    title: 'Iniciar sesión | Red Social',
    canActivate: [guestGuard],
  },
  {
    path: 'registro',
    component: Registro,
    title: 'Registro | Red Social',
    canActivate: [guestGuard],
  },
  {
    path: 'publicaciones',
    component: Publicaciones,
    title: 'Publicaciones | Red Social',
    canActivate: [authGuard],
  },
  {
    path: 'publicaciones/:id',
    component: PublicacionDetalle,
    title: 'Publicación | Red Social',
    canActivate: [authGuard],
  },
  {
    path: 'mi-perfil',
    component: MiPerfil,
    title: 'Mi perfil | Red Social',
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'cargando' },
];
