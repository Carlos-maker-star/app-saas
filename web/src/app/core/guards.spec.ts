import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { Auth } from './auth.service';
import { sinNegocio, soloAdmin, soloCliente, soloInvitados } from './guards';

/** Un Auth falso: con o sin sesión */
function auth(conSesion: boolean, negocio = true, admin = false) {
  return {
    listo: Promise.resolve(),
    usuario: () => (conSesion ? { id: 'u' } : null),
    tieneNegocio: () => negocio,
    esAdmin: () => admin,
    destino: () => (admin ? '/admin' : negocio ? '/panel' : '/crear-negocio'),
  };
}

async function correr(guard: typeof soloInvitados, a: ReturnType<typeof auth>) {
  TestBed.configureTestingModule({ providers: [{ provide: Auth, useValue: a }] });
  const r = await TestBed.runInInjectionContext(() => guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
  return r === true ? true : TestBed.inject(Router).serializeUrl(r as never);
}

describe('guards de rutas', () => {
  it('login y registro: sin sesión pasan; con sesión llevan a su destino (sin romperse tras el await)', async () => {
    expect(await correr(soloInvitados, auth(false))).toBe(true);
    TestBed.resetTestingModule();
    expect(await correr(soloInvitados, auth(true))).toBe('/panel');
    TestBed.resetTestingModule();
    expect(await correr(soloInvitados, auth(true, false))).toBe('/crear-negocio');
  });

  it('el resto de guards redirigen sin sesión', async () => {
    for (const g of [soloCliente, soloAdmin, sinNegocio]) {
      TestBed.resetTestingModule();
      expect(await correr(g, auth(false))).toBe('/login');
    }
  });
});
