import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login', // Cambiado a 'login' para que sea la página inicial
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.page').then((m) => m.RegistroPage),
  },
  {
    path: 'inicio',
    loadComponent: () => import('./inicio/inicio.page').then((m) => m.InicioPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
];