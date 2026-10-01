import { Tema } from './models';

const HEX = /^#[0-9a-f]{6}$/i;
const FUENTE = /^[A-Za-z0-9 ]{2,40}$/;
const RADIO = /^\d{1,2}(px|rem)$/;

function luminancia(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Texto negro o blanco, el que dé más contraste sobre `fondo`. */
export function colorSobre(fondo: string): string {
  return luminancia(fondo) > 0.35 ? '#111111' : '#ffffff';
}

/** Ratio de contraste WCAG entre dos colores (para avisar en el editor). */
export function contraste(a: string, b: string): number {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Convierte el JSON del tema en variables CSS (valores validados). */
export function estiloTema(t: Tema): Record<string, string> {
  const c = t.colores;
  const ok = (v: string, def: string) => (HEX.test(v) ? v : def);
  const brand = ok(c.primario, '#2563eb');
  const bg = ok(c.fondo, '#ffffff');
  const ink = ok(c.texto, '#111111');
  const fuente = (f: string, def: string) => `'${FUENTE.test(f) ? f : def}', ${def === 'Inter' ? 'sans-serif' : 'serif'}`;
  return {
    '--brand': brand,
    '--on-brand': colorSobre(brand),
    '--accent': ok(c.acento, brand),
    '--bg': bg,
    '--ink': ink,
    '--radius': RADIO.test(t.radio) ? t.radio : '12px',
    '--fd': fuente(t.fuentes.titulos, 'Inter'),
    '--fb': fuente(t.fuentes.texto, 'Inter'),
    '--ph': `linear-gradient(135deg, color-mix(in srgb, ${ok(c.acento, brand)} 30%, ${bg}), color-mix(in srgb, ${ok(c.acento, brand)} 65%, ${bg}))`,
  };
}

/** Carga la fuente de Google si no está ya en la página (solo nombres validados). */
export function cargarFuentes(t: Tema, doc: Document): void {
  for (const f of [t.fuentes.titulos, t.fuentes.texto]) {
    if (!FUENTE.test(f)) continue;
    const id = 'font-' + f.replaceAll(' ', '-');
    if (doc.getElementById(id)) continue;
    const link = doc.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f)}:wght@400;500;600;700&display=swap`;
    doc.head.appendChild(link);
  }
}
