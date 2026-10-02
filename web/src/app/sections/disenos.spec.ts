import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DISENOS, IDS_DISENO } from '../core/disenos';
import { LandingStore } from '../core/landing.store';
import { Rubro } from '../core/models';
import { LandingVista } from './landing-vista';

const RUBROS: Rubro[] = ['cafeteria', 'barberia', 'perfumes', 'salud'];

function pintar(rubro: Rubro, diseno: string) {
  TestBed.resetTestingModule();
  const store = TestBed.inject(LandingStore);
  store.cargarDemo(rubro, diseno);
  const f = TestBed.createComponent(LandingVista);
  f.detectChanges();
  return { store, el: f.nativeElement as HTMLElement };
}

describe('los 12 diseños se dibujan con los datos de ejemplo', () => {
  for (const rubro of RUBROS) for (const dis of IDS_DISENO) {
    it(`${rubro}-${dis}`, () => {
      const { store, el } = pintar(rubro, dis);
      expect(store.estilo()).toBe(`${rubro}-${dis}`);
      expect(el.querySelector('.landing')?.getAttribute('data-estilo')).toBe(`${rubro}-${dis}`);
      const texto = el.textContent ?? '';
      expect(texto).toContain(store.nombre());
      expect(texto).not.toContain('undefined');
      expect(texto).not.toContain('NaN');
      // la portada propia del diseño: tiene un título (h1) y el botón de WhatsApp
      expect(el.querySelectorAll('h1').length).toBe(1);
      expect([...el.querySelectorAll('a')].some((a) => a.getAttribute('href')?.startsWith('https://wa.me/'))).toBe(true);
    });
  }

  it('un diseño desconocido en la URL usa el a', () => {
    const { store } = pintar('salud', 'zzz');
    expect(store.estilo()).toBe('salud-a');
  });

  it('cada rubro tiene sus 3 diseños con nombre y resumen', () => {
    for (const r of RUBROS) for (const d of DISENOS[r]) { expect(d.nombre.length).toBeGreaterThan(2); expect(d.resumen.length).toBeGreaterThan(10); }
  });
});

describe('tarifario de la barbería (Poste clásico)', () => {
  it('marca el primer servicio y suma al elegir otros', async () => {
    const { el } = pintar('barberia', 'b');
    const botones = [...el.querySelectorAll<HTMLButtonElement>('.pos-sv')];
    expect(botones.length).toBeGreaterThan(2);
    expect(botones[0].getAttribute('aria-pressed')).toBe('true');
    expect(botones[1].getAttribute('aria-pressed')).toBe('false');
    expect(el.querySelector('.pos-total')?.textContent).toContain('25');
    botones[1].click();
    await new Promise((r) => setTimeout(r, 200)); // el cambio espera 110 ms para el desenfoque
    TestBed.tick();
    expect(el.querySelector('.pos-total')?.textContent).toContain('43');
    expect(el.querySelector('.pos-msg')?.textContent).toContain('Corte clásico + Arreglo de barba');
  });
});
