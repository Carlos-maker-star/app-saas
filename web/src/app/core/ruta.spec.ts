import { describe, expect, it } from 'vitest';
import { getRuta, setRuta } from './ruta';
import { limpiarRedes, normalizarRed } from './redes';

describe('getRuta / setRuta', () => {
  it('lee y escribe rutas anidadas sin mutar el original', () => {
    const o = { boton: { texto: 'Hola' }, dias: [{ dia: 'Lun', hora: '8' }] };
    const n = setRuta(o, 'boton.texto', 'Chao');
    expect(getRuta(n, 'boton.texto')).toBe('Chao');
    expect(o.boton.texto).toBe('Hola');
  });

  it('crea los niveles que faltan', () => {
    expect(getRuta(setRuta({}, 'stat.valor', 12), 'stat.valor')).toBe(12);
  });

  it('edita un elemento de una lista por índice', () => {
    const o = { dias: [{ dia: 'Lun', hora: '8' }, { dia: 'Mar', hora: '9' }] };
    const n = setRuta(o, 'dias.1.hora', '10');
    expect(n.dias[1].hora).toBe('10');
    expect(n.dias[0]).toEqual({ dia: 'Lun', hora: '8' });
    expect(Array.isArray(n.dias)).toBe(true);
  });

  it('getRuta devuelve undefined si no existe', () => {
    expect(getRuta({}, 'a.b.c')).toBeUndefined();
  });
});

describe('normalizarRed', () => {
  it('convierte @usuario en el enlace de la red', () => {
    expect(normalizarRed('instagram', '@cafe_aroma')).toBe('https://instagram.com/cafe_aroma');
    expect(normalizarRed('tiktok', 'cafe')).toBe('https://tiktok.com/@cafe');
  });
  it('añade https a un dominio sin esquema', () => {
    expect(normalizarRed('web', 'www.miweb.com')).toBe('https://www.miweb.com');
  });
  it('acepta https y rechaza javascript:, http: y data:', () => {
    expect(normalizarRed('facebook', 'https://facebook.com/x')).toBe('https://facebook.com/x');
    expect(normalizarRed('facebook', 'javascript:alert(1)')).toBe('');
    expect(normalizarRed('facebook', 'http://facebook.com/x')).toBe('');
    expect(normalizarRed('web', 'data:text/html,hola')).toBe('');
  });
  it('un texto suelto no sirve como sitio web', () => {
    expect(normalizarRed('web', 'mi negocio')).toBe('');
  });
  it('vacío queda vacío y limpiarRedes quita vacíos', () => {
    expect(normalizarRed('x', '  ')).toBe('');
    expect(limpiarRedes({ instagram: 'https://instagram.com/a', x: '' })).toEqual({ instagram: 'https://instagram.com/a' });
  });
});
