import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth.service';

/** Páginas de login / registro: si ya hay sesión, va a su destino */
export const soloInvitados: CanActivateFn = async () => {
  const auth = inject(Auth);
  await auth.listo;
  return auth.usuario() ? inject(Router).parseUrl(auth.destino()) : true;
};

/** Crear negocio: requiere sesión y no tener negocio todavía */
export const sinNegocio: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  await auth.listo;
  if (!auth.usuario()) return router.parseUrl('/login');
  return auth.tieneNegocio() || auth.esAdmin() ? router.parseUrl(auth.destino()) : true;
};

/** Panel del cliente: requiere sesión y un negocio */
export const soloCliente: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  await auth.listo;
  if (!auth.usuario()) return router.parseUrl('/login');
  return auth.tieneNegocio() ? true : router.parseUrl(auth.destino());
};

/** Panel del super admin */
export const soloAdmin: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  await auth.listo;
  if (!auth.usuario()) return router.parseUrl('/login');
  return auth.esAdmin() ? true : router.parseUrl(auth.destino());
};
