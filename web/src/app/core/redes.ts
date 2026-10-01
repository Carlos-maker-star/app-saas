import { Redes } from './models';

export type NombreRed = keyof Redes;

export const REDES: { id: NombreRed; nombre: string; base: string; ejemplo: string }[] = [
  { id: 'instagram', nombre: 'Instagram', base: 'https://instagram.com/', ejemplo: '@tunegocio' },
  { id: 'facebook', nombre: 'Facebook', base: 'https://facebook.com/', ejemplo: 'tunegocio' },
  { id: 'tiktok', nombre: 'TikTok', base: 'https://tiktok.com/@', ejemplo: '@tunegocio' },
  { id: 'youtube', nombre: 'YouTube', base: 'https://youtube.com/@', ejemplo: '@tunegocio' },
  { id: 'x', nombre: 'X (Twitter)', base: 'https://x.com/', ejemplo: '@tunegocio' },
  { id: 'linkedin', nombre: 'LinkedIn', base: 'https://linkedin.com/company/', ejemplo: 'tunegocio' },
  { id: 'web', nombre: 'Sitio web', base: 'https://', ejemplo: 'www.tunegocio.com' },
];

/**
 * Acepta "@usuario", "usuario" o una URL y devuelve siempre una URL https.
 * Cualquier otro esquema (javascript:, http:, etc.) se descarta: devuelve ''.
 */
export function normalizarRed(red: NombreRed, valor: string): string {
  const v = valor.trim();
  if (!v) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return /^https:\/\//i.test(v) ? v : '';
  if (/^(www\.)?[\w-]+(\.[\w-]+)+(\/|$)/.test(v)) return 'https://' + v;
  const def = REDES.find((r) => r.id === red)!;
  if (red === 'web') return '';
  return def.base + v.replace(/^@/, '').replace(/[^\w.\-]/g, '');
}

export function limpiarRedes(r: Redes): Redes {
  return Object.fromEntries(Object.entries(r).filter(([, v]) => !!v)) as Redes;
}
