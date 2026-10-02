import { describe, expect, it } from 'vitest';
import { abiertoAhora, diasDe, rango } from './abierto';
import { DISENOS, disenoDe, estiloDe, extrasDe, pedidoFuente } from './disenos';
import { Rubro } from './models';
import { lineas, lista, resaltar } from './texto';
import { contraste, estiloTema } from './tema';

const RUBROS: Rubro[] = ['cafeteria', 'barberia', 'perfumes', 'salud'];
const HEX = /^#[0-9a-f]{6}$/i;

describe('diseños de cada rubro', () => {
  it('cada rubro ofrece exactamente 3 diseños: a, b y c', () => {
    for (const r of RUBROS) expect(DISENOS[r].map((d) => d.id)).toEqual(['a', 'b', 'c']);
  });

  it('todos los temas son válidos y traen su diseño', () => {
    for (const r of RUBROS) for (const d of DISENOS[r]) {
      const v = estiloTema(d.tema, r);
      expect(d.tema.diseno).toBe(d.id);
      for (const k of Object.values(d.tema.colores)) expect(k).toMatch(HEX);
      expect(d.tema.radio).toMatch(/^\d{1,2}(px|rem)$/);
      expect(v['--brand']).toBe(d.tema.colores.primario); // el color no fue descartado por inválido
      expect(v['--radius']).toBe(d.tema.radio);
    }
  });

  it('el texto se lee sobre el fondo en todas las paletas (contraste ≥ 4.5)', () => {
    for (const r of RUBROS) for (const d of DISENOS[r]) for (const p of d.paletas) {
      expect(contraste(p.colores.texto, p.colores.fondo), `${r}-${d.id} ${p.nombre}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('la primera paleta de cada diseño es la del propio diseño', () => {
    for (const r of RUBROS) for (const d of DISENOS[r]) expect(d.paletas[0].colores).toEqual(d.tema.colores);
  });

  it('los negocios anteriores (sin diseño) usan el a', () => {
    expect(disenoDe({})).toBe('a');
    expect(disenoDe({ diseno: 'c' })).toBe('c');
    expect(disenoDe({ diseno: 'zzz' as never })).toBe('a');
    expect(disenoDe(null)).toBe('a');
    expect(estiloDe('salud', 'b')).toBe('salud-b');
  });

  it('las tipografías de un solo peso se piden sin pesos que no existen', () => {
    expect(pedidoFuente('Alfa Slab One')).toBe('');
    expect(pedidoFuente('Archivo Black')).toBe('');
    expect(pedidoFuente('Inter')).toBe('wght@400;500;600;700');
    expect(extrasDe('barberia', 'b')).toEqual(['Barlow Condensed']);
    expect(extrasDe('barberia', 'a')).toEqual([]);
  });
});

describe('texto', () => {
  it('resalta las últimas palabras del título', () => {
    expect(resaltar('Buen café. Buen día.', 2)).toEqual({ antes: 'Buen café.', resalte: 'Buen día.' });
    expect(resaltar('Hola', 2)).toEqual({ antes: 'Hola', resalte: '' });
    expect(resaltar(null)).toEqual({ antes: '', resalte: '' });
  });

  it('separa listas y líneas', () => {
    expect(lista('Corte, Barba;  Fade ,')).toEqual(['Corte', 'Barba', 'Fade']);
    expect(lineas('Corte. Barba. Estilo.')).toEqual(['Corte.', 'Barba.', 'Estilo.']);
    expect(lineas('Corte limpio barba al ras para ti')).toEqual(['Corte', 'limpio', 'barba al ras para ti']);
  });
});

describe('abierto ahora', () => {
  const dia = (iso: string) => new Date(iso); // fecha local sin zona: se interpreta en hora local
  const lunes10 = dia('2026-03-02T10:00:00');   // lunes
  const domingo10 = dia('2026-03-01T10:00:00'); // domingo

  it('entiende rangos de días y de horas', () => {
    expect(diasDe('Lun – Vie')).toEqual([1, 2, 3, 4, 5]);
    expect(diasDe('Sáb - Dom')).toEqual([6, 0]);
    expect(diasDe('Domingo')).toEqual([0]);
    expect(rango('7:00 – 21:00')).toEqual([420, 1260]);
    expect(rango('8 am - 10 pm')).toEqual([480, 1320]);
    expect(rango('Cerrado')).toBeNull();
  });

  it('dice si está abierto y cuándo cierra o abre', () => {
    const h = [{ dia: 'Lun – Vie', hora: '7:00 – 21:00' }, { dia: 'Sáb – Dom', hora: '8:00 – 22:00' }];
    expect(abiertoAhora(h, lunes10)).toEqual({ abierto: true, texto: 'Abierto ahora · cierra 9 pm' });
    expect(abiertoAhora(h, dia('2026-03-02T05:30:00'))).toEqual({ abierto: false, texto: 'Cerrado · abre a las 7 am' });
    expect(abiertoAhora(h, dia('2026-03-02T22:30:00'))?.abierto).toBe(false);
    expect(abiertoAhora(h, domingo10)?.abierto).toBe(true);
  });

  it('cerrado los días marcados y null si no se entiende el horario', () => {
    expect(abiertoAhora([{ dia: 'Lun – Sáb', hora: '10:00 – 20:00' }, { dia: 'Domingo', hora: 'Cerrado' }], domingo10)).toEqual({ abierto: false, texto: 'Cerrado hoy' });
    expect(abiertoAhora([{ dia: 'Cuando se pueda', hora: 'a veces' }], lunes10)).toBeNull();
    expect(abiertoAhora([], lunes10)).toBeNull();
  });

  it('horarios que cruzan la medianoche', () => {
    const h = [{ dia: 'Vie – Sáb', hora: '20:00 – 02:00' }];
    expect(abiertoAhora(h, dia('2026-03-06T23:00:00'))?.abierto).toBe(true); // viernes 23:00
    expect(abiertoAhora(h, dia('2026-03-06T15:00:00'))?.abierto).toBe(false);
  });
});
