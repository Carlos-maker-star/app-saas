export function precio(valor: number | null | undefined, moneda = 'S/'): string {
  return valor == null ? '' : `${moneda} ${valor.toLocaleString('es-PE')}`;
}

/** "hace 3 días", "hace 2 h"… */
export function hace(iso: string | null | undefined): string {
  if (!iso) return '—';
  const seg = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const [n, u] = seg < 60 ? [0, ''] : seg < 3600 ? [seg / 60, 'min'] : seg < 86400 ? [seg / 3600, 'h'] : [seg / 86400, 'd'];
  if (!u) return 'ahora';
  const v = Math.floor(n);
  return u === 'd' && v >= 30 ? new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : `hace ${v} ${u === 'd' ? (v === 1 ? 'día' : 'días') : u}`;
}
