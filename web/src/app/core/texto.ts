/**
 * Separa el título para resaltar sus últimas `n` palabras ("Buen café. Buen día." → "Buen café." + "Buen día.").
 * Si el título es muy corto, no se resalta nada (queda todo en `antes`).
 */
export function resaltar(titulo: string | null | undefined, n = 2): { antes: string; resalte: string } {
  const palabras = (titulo ?? '').trim().split(/\s+/).filter(Boolean);
  if (palabras.length <= n) return { antes: palabras.join(' '), resalte: '' };
  return { antes: palabras.slice(0, -n).join(' '), resalte: palabras.slice(-n).join(' ') };
}

/** "Corte, Barba, Fade" → ["Corte", "Barba", "Fade"] (separadas por coma o punto y coma) */
export function lista(texto: string | null | undefined): string[] {
  return String(texto ?? '').split(/[,;]/).map((t) => t.trim()).filter(Boolean);
}

/** "Corte. Barba. Estilo." → ["Corte.", "Barba.", "Estilo."]; si no hay puntos, separa por palabras (máx. 3 líneas). */
export function lineas(titulo: string | null | undefined, max = 3): string[] {
  const t = (titulo ?? '').trim();
  const frases = t.match(/[^.!?]+[.!?]?/g)?.map((f) => f.trim()).filter(Boolean) ?? [];
  const base = frases.length > 1 ? frases : t.split(/\s+/).filter(Boolean);
  return base.length <= max ? base : [...base.slice(0, max - 1), base.slice(max - 1).join(' ')];
}
