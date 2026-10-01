import { Rubro } from './models';
import { colorSobre } from './tema';

/**
 * Iconos de pestaña (favicon) generados: un cuadrado redondeado del color de marca con el dibujo
 * del rubro. Los usa el servidor (/icono.svg) y la app (vista previa y <head>).
 */

const HEX6 = /^#?[0-9a-f]{6}$/i;

/** Acepta "c8352b" o "#c8352b"; cualquier otra cosa devuelve `def` (así nada raro llega al SVG). */
export function colorHex(v: unknown, def: string): string {
  const s = typeof v === 'string' ? v.trim() : '';
  return HEX6.test(s) ? (s.startsWith('#') ? s : '#' + s).toLowerCase() : def;
}

/** Dibujos de 24×24 (trazo) */
const GLIFOS: Record<string, string> = {
  cafeteria: '<path d="M17 8h1a4 4 0 0 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 2v3M10 2v3M14 2v3"/>',
  barberia: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
  perfumes: '<path d="M9 2h6v4H9zM7 6h10v3a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3zM5 12h14v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/>',
  salud: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
  // la plataforma (SaaS): una ventana de landing page
  plataforma: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M8 14h4"/>',
};

export const COLOR_PLATAFORMA = '#4338ca';

export function svgIcono(clave: string, fondo: string, tinta: string): string {
  const glifo = GLIFOS[clave] ?? GLIFOS['plataforma'];
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="14" fill="${colorHex(fondo, COLOR_PLATAFORMA)}"/>` +
    `<g transform="translate(12.8 12.8) scale(1.6)" fill="none" stroke="${colorHex(tinta, '#ffffff')}" ` +
    `stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${glifo}</g></svg>`
  );
}

/** Dirección del icono generado para un negocio (la sirve /icono.svg en el servidor) */
export function urlIconoRubro(rubro: Rubro, primario: string): string {
  const c = colorHex(primario, COLOR_PLATAFORMA);
  return `/icono.svg?r=${rubro}&c=${c.slice(1)}&f=${colorSobre(c).slice(1)}`;
}
