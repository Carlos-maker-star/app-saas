import { Routes } from '@angular/router';
import { sinNegocio, soloAdmin, soloCliente, soloInvitados } from './core/guards';
import { InicioPage } from './pages/inicio.page';
import { LandingPage } from './pages/landing.page';

const shell = () => import('./layout/shell').then((m) => m.Shell);

export const routes: Routes = [
  { path: '', component: InicioPage },
  { path: 'n/:slug', component: LandingPage },     // negocio real
  { path: 'demo/:rubro', component: LandingPage }, // plantilla con datos de ejemplo
  { path: 'vista-previa', loadComponent: () => import('./pages/vista-previa.page').then((m) => m.VistaPreviaPage) }, // iframe del editor
  { path: 'editor', canActivate: [soloCliente], loadComponent: () => import('./pages/editor.page').then((m) => m.EditorPage) },

  // Cuentas y paneles (se cargan bajo demanda para no inflar la landing pública)
  { path: 'login', canActivate: [soloInvitados], loadComponent: () => import('./pages/login.page').then((m) => m.LoginPage) },
  { path: 'registro', canActivate: [soloInvitados], loadComponent: () => import('./pages/registro.page').then((m) => m.RegistroPage) },
  { path: 'crear-negocio', canActivate: [sinNegocio], loadComponent: () => import('./pages/crear-negocio.page').then((m) => m.CrearNegocioPage) },
  {
    path: 'panel', canActivate: [soloCliente], loadComponent: shell, data: { modo: 'cliente' },
    children: [{ path: '', loadComponent: () => import('./pages/panel-inicio.page').then((m) => m.PanelInicioPage) }],
  },
  {
    path: 'admin', canActivate: [soloAdmin], loadComponent: shell, data: { modo: 'admin' },
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./pages/admin-resumen.page').then((m) => m.AdminResumenPage) },
      { path: 'clientes', loadComponent: () => import('./pages/admin-clientes.page').then((m) => m.AdminClientesPage) },
    ],
  },

  { path: '**', redirectTo: '' },
];
