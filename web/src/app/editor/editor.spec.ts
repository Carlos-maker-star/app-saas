import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { datosDemo, RUBROS } from '../core/demo-data';
import { EditorStore } from '../core/editor.store';
import { ESQUEMAS, TIPOS_AGREGABLES } from '../core/esquemas';
import { Diseno, LandingPublica } from '../core/models';
import { FormSeccion } from './form-seccion';
import { TabContenido } from './tab-contenido';
import { TabDiseno } from './tab-diseno';
import { TabNegocio } from './tab-negocio';
import { TabSeo } from './tab-seo';

const DISENOS_IDS: Diseno[] = ['a', 'b', 'c'];

/** Un EditorStore falso, con las señales que usan los formularios */
function tienda(d: LandingPublica) {
  const secciones = signal(d.contenido);
  return {
    rubro: signal(d.rubro), diseno: signal(d.tema.diseno ?? 'a'), estilo: signal(d.rubro + '-' + (d.tema.diseno ?? 'a')), slug: signal('demo'), items: signal(d.items), secciones,
    negocio: signal({ nombre: d.nombre, whatsapp: d.whatsapp ?? '', logo_url: null, email: '', telefono: '', direccion: '', redes: {} }),
    tema: signal(d.tema), seo: signal({}),
    tiposDisponibles: signal(TIPOS_AGREGABLES),
    itemsPendientes: signal(0),
    setDato: vi.fn(), setNegocio: vi.fn(), setRed: vi.fn(), setSeo: vi.fn(), setColor: vi.fn(), setColores: vi.fn(),
    setFuentes: vi.fn(), setRadio: vi.fn(), restablecerTema: vi.fn(), setDiseno: vi.fn(), mover: vi.fn(), alternarVisible: vi.fn(),
    eliminarSeccion: vi.fn(), agregarSeccion: vi.fn(() => 'x'), editarItem: vi.fn(), agregarItem: vi.fn(), eliminarItem: vi.fn(),
    moverItem: vi.fn(),
  } as unknown as EditorStore;
}

function montar<T>(tipo: new () => T, d: LandingPublica, entradas: Record<string, unknown> = {}) {
  TestBed.configureTestingModule({ providers: [{ provide: EditorStore, useValue: tienda(d) }] });
  const f = TestBed.createComponent(tipo);
  for (const [k, v] of Object.entries(entradas)) f.componentRef.setInput(k, v);
  f.detectChanges();
  return f;
}

describe('formularios de sección', () => {
  for (const rubro of RUBROS) for (const dis of DISENOS_IDS) {
    const d = datosDemo(rubro, dis);
    for (const sec of d.contenido) {
      it(`${rubro}-${dis} / ${sec.tipo}: se dibuja con sus campos`, () => {
        const f = montar(FormSeccion, d, { seccion: sec });
        const el: HTMLElement = f.nativeElement;
        expect(el.querySelectorAll('input, textarea, select, button').length).toBeGreaterThan(0);
        expect(el.textContent).not.toContain('undefined');
      });
    }
  }

  it('el esquema tiene todos los tipos agregables', () => {
    for (const t of TIPOS_AGREGABLES) expect(ESQUEMAS[t].elementos.length).toBeGreaterThan(0);
  });

  /** Texto del formulario de la portada de un diseño */
  const portada = (rubro: (typeof RUBROS)[number], dis: Diseno) => {
    const d = datosDemo(rubro, dis);
    const el = montar(FormSeccion, d, { seccion: d.contenido[0] }).nativeElement as HTMLElement;
    const texto = el.textContent ?? '';
    TestBed.resetTestingModule();
    return texto;
  };

  it('cada diseño de la portada muestra solo los campos que usa', () => {
    expect(portada('salud', 'a')).toContain('Cifra destacada');
    expect(portada('salud', 'b')).not.toContain('Cifra destacada');
    expect(portada('salud', 'b')).toContain('Calificación');
    expect(portada('salud', 'c')).toContain('Horas de la agenda');
    expect(portada('cafeteria', 'a')).not.toContain('Cifra destacada');
    expect(portada('cafeteria', 'a')).toContain('Calificación');
    expect(portada('cafeteria', 'b')).toContain('Título de la etiqueta');
    expect(portada('cafeteria', 'b')).not.toContain('Palabras de la cinta');
    expect(portada('cafeteria', 'c')).toContain('Palabras de la cinta');
    expect(portada('barberia', 'a')).toContain('Palabras de la cinta');
    expect(portada('barberia', 'b')).not.toContain('Palabras de la cinta');
  });
});

describe('pestañas del editor', () => {
  for (const rubro of RUBROS) for (const dis of DISENOS_IDS) {
    const d = datosDemo(rubro, dis);
    it(`${rubro}-${dis}: contenido, diseño, negocio y SEO se dibujan`, () => {
      expect(montar(TabContenido, d).nativeElement.textContent).toContain('Portada');
      TestBed.resetTestingModule();
      expect(montar(TabDiseno, d).nativeElement.textContent).toContain('Paletas sugeridas');
      TestBed.resetTestingModule();
      expect(montar(TabNegocio, d).nativeElement.textContent).toContain('Redes sociales');
      TestBed.resetTestingModule();
      expect(montar(TabSeo, d).nativeElement.textContent).toContain('Google');
    });
  }

  it('al abrir una sección se muestra su formulario', () => {
    const d = datosDemo('barberia');
    const f = montar(TabContenido, d);
    expect(f.nativeElement.textContent).toContain('Título principal'); // la portada empieza abierta
  });
});
