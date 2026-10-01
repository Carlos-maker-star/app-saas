import { describe, expect, it } from 'vitest';
import { buildWhatsAppUrl } from './whatsapp';
import { urlSegura } from './seguridad';
import { colorSobre } from './tema';

describe('buildWhatsAppUrl', () => {
  it('deja solo dígitos en el número y codifica el mensaje', () => {
    expect(buildWhatsAppUrl('+51 987-654-321', 'Hola, quiero {nombre}', 'Café & té'))
      .toBe('https://wa.me/51987654321?text=Hola%2C%20quiero%20Caf%C3%A9%20%26%20t%C3%A9');
  });
  it('tolera número vacío', () => {
    expect(buildWhatsAppUrl(null, 'Hola')).toBe('https://wa.me/?text=Hola');
  });
});

describe('urlSegura', () => {
  it('acepta https', () => expect(urlSegura('https://instagram.com/x')).toBe('https://instagram.com/x'));
  it('rechaza javascript:, http y basura', () => {
    expect(urlSegura('javascript:alert(1)')).toBeNull();
    expect(urlSegura('http://x.com')).toBeNull();
    expect(urlSegura('no es url')).toBeNull();
    expect(urlSegura(null)).toBeNull();
  });
});

describe('colorSobre', () => {
  it('texto oscuro sobre dorado y claro sobre café', () => {
    expect(colorSobre('#C9A227')).toBe('#111111');
    expect(colorSobre('#6F4E37')).toBe('#ffffff');
  });
});

describe('slugify', () => {
  it('quita tildes, símbolos y limita el largo', async () => {
    const { slugify } = await import('./slug');
    expect(slugify('Café Don Filo!!')).toBe('cafe-don-filo');
    expect(slugify('  Ñandú & Co.  ')).toBe('nandu-co');
    expect(slugify('x'.repeat(60)).length).toBe(40);
  });
});
