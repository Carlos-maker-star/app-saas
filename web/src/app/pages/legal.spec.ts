import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { LEGAL } from '../core/legal-textos';
import { MARCA } from '../core/marca';
import { urlSoporte } from '../core/soporte';
import { LegalPage } from './legal.page';

function pintar(doc: 'terminos' | 'privacidad') {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const f = TestBed.createComponent(LegalPage);
  f.componentRef.setInput('doc', doc);
  f.detectChanges();
  return f.nativeElement as HTMLElement;
}

describe('textos legales', () => {
  for (const doc of ['terminos', 'privacidad'] as const) {
    it(`${doc}: muestra título y todas las secciones`, () => {
      const el = pintar(doc);
      expect(el.querySelector('h1')?.textContent).toContain(LEGAL[doc].titulo);
      expect(el.querySelectorAll('h2').length).toBe(LEGAL[doc].bloques.length);
      expect(el.textContent).not.toContain('undefined');
    });
  }
});

describe('urlSoporte con WhatsApp', () => {
  it('abre WhatsApp con el mensaje y el nombre del negocio', () => {
    const u = urlSoporte('Barber Michel', 'a@b.com');
    expect(u.startsWith(`https://wa.me/${MARCA.soporte.whatsapp}?text=`)).toBe(true);
    expect(decodeURIComponent(u)).toContain('Barber Michel');
  });
});
