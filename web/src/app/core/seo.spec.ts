import { describe, expect, it } from 'vitest';
import { datosDemo } from './demo-data';
import { jsonLd, jsonSeguro, metaLanding, recortar, slugDeHost } from './seo';

describe('metaLanding', () => {
  it('deduce título, descripción e imagen cuando el dueño no los puso', () => {
    const d = datosDemo('cafeteria');
    const m = metaLanding(d);
    expect(m.titulo).toBe('Café Aroma · Cafetería');
    expect(m.descripcion).toContain('Granos de altura');
    expect(m.imagen).toBeNull();
  });

  it('usa lo que escribió el dueño y recorta a 160 caracteres', () => {
    const d = datosDemo('salud');
    d.seo = { titulo: 'Clínica Vida | Trujillo', descripcion: 'x'.repeat(300), imagen: 'https://cdn.ejemplo.com/a.webp' };
    const m = metaLanding(d);
    expect(m.titulo).toBe('Clínica Vida | Trujillo');
    expect(m.descripcion.length).toBe(160);
    expect(m.imagen).toBe('https://cdn.ejemplo.com/a.webp');
  });

  it('ignora imágenes que no sean https', () => {
    const d = datosDemo('salud');
    d.seo = { imagen: 'javascript:alert(1)' };
    d.logo_url = 'http://inseguro.com/logo.png';
    expect(metaLanding(d).imagen).toBeNull();
  });
});

describe('jsonLd', () => {
  it('arma el negocio local con su tipo, teléfono, dirección y redes', () => {
    const d = datosDemo('barberia');
    d.redes = { instagram: 'https://instagram.com/donfilo', facebook: 'javascript:x' };
    const o = jsonLd(d, 'https://don-filo.tuapp.com/');
    expect(o['@type']).toBe('HairSalon');
    expect(o['name']).toBe('Barbería Don Filo');
    expect(o['url']).toBe('https://don-filo.tuapp.com/');
    expect(o['telephone']).toBe('900 000 000');
    expect(o['address']).toEqual({ '@type': 'PostalAddress', streetAddress: 'Calle Mercaderes 456, Arequipa' });
    expect(o['sameAs']).toEqual(['https://instagram.com/donfilo']);
  });

  it('sin teléfono usa el WhatsApp con +', () => {
    const d = datosDemo('perfumes');
    d.telefono = null;
    expect(jsonLd(d, 'https://x.com/')['telephone']).toBe('+51900000000');
  });
});

describe('jsonSeguro', () => {
  it('escapa "<" para que un texto no pueda cerrar el <script>', () => {
    const s = jsonSeguro({ nombre: '</script><script>alert(1)</script>' });
    expect(s).not.toContain('</script>');
    expect(JSON.parse(s).nombre).toBe('</script><script>alert(1)</script>');
  });
});

describe('slugDeHost', () => {
  it('saca el negocio del subdominio', () => {
    expect(slugDeHost('don-filo.tuapp.com', 'tuapp.com')).toBe('don-filo');
    expect(slugDeHost('Don-Filo.tuapp.com:4000', 'tuapp.com')).toBe('don-filo');
  });
  it('no confunde el dominio principal, www ni otros dominios', () => {
    expect(slugDeHost('tuapp.com', 'tuapp.com')).toBeNull();
    expect(slugDeHost('www.tuapp.com', 'tuapp.com')).toBeNull();
    expect(slugDeHost('app.tuapp.com', 'tuapp.com')).toBeNull();
    expect(slugDeHost('a.b.tuapp.com', 'tuapp.com')).toBeNull();
    expect(slugDeHost('cafe.otrodominio.com', 'tuapp.com')).toBeNull();
    expect(slugDeHost('cafe.tuapp.com', '')).toBeNull();
  });
});

describe('recortar', () => {
  it('no toca los textos cortos y compacta espacios', () => {
    expect(recortar('  hola   mundo ', 20)).toBe('hola mundo');
  });
});
