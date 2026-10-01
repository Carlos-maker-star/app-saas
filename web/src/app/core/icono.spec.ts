import { describe, expect, it } from 'vitest';
import { colorHex, svgIcono, urlIconoRubro } from './icono';

describe('colorHex', () => {
  it('acepta con o sin # y normaliza a minúsculas', () => {
    expect(colorHex('C9A227', '#000000')).toBe('#c9a227');
    expect(colorHex('#C9A227', '#000000')).toBe('#c9a227');
  });
  it('rechaza cualquier cosa que no sea un color hexadecimal de 6 dígitos', () => {
    expect(colorHex('red', '#111111')).toBe('#111111');
    expect(colorHex('"/><script>', '#111111')).toBe('#111111');
    expect(colorHex(undefined, '#111111')).toBe('#111111');
    expect(colorHex('#fff', '#111111')).toBe('#111111');
  });
});

describe('svgIcono', () => {
  it('dibuja el glifo del rubro con los colores pedidos', () => {
    const s = svgIcono('barberia', '#c9a227', '#111111');
    expect(s).toContain('fill="#c9a227"');
    expect(s).toContain('stroke="#111111"');
    expect(s).toContain('<circle'); // tijeras
  });
  it('un rubro desconocido cae en el icono de la plataforma', () => {
    expect(svgIcono('otro', '#4338ca', '#ffffff')).toContain('<rect x="3" y="4"');
  });
  it('no deja colores sin validar dentro del SVG', () => {
    const s = svgIcono('cafeteria', '"><script>alert(1)</script>', 'x');
    expect(s).not.toContain('<script');
    expect(s).toContain('fill="#4338ca"');
  });
});

describe('urlIconoRubro', () => {
  it('usa el color de marca de fondo y el texto que más contraste dé', () => {
    expect(urlIconoRubro('barberia', '#C9A227')).toBe('/icono.svg?r=barberia&c=c9a227&f=111111');
    expect(urlIconoRubro('cafeteria', '#6F4E37')).toBe('/icono.svg?r=cafeteria&c=6f4e37&f=ffffff');
  });
});
