/**
 * Todo enlace o imagen que viene de la base de datos pasa por aquí:
 * solo se aceptan URLs https (bloquea javascript:, data:, etc.).
 */
export function urlSegura(valor: unknown): string | null {
  if (typeof valor !== 'string') return null;
  try {
    const u = new URL(valor.trim());
    return u.protocol === 'https:' ? u.href : null;
  } catch {
    return null;
  }
}

export function enlaceMapa(direccion: string | null | undefined): string | null {
  const d = (direccion ?? '').trim();
  return d ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d)}` : null;
}
