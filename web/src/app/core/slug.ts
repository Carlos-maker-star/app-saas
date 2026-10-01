/** "Café Don Filo!" -> "cafe-don-filo" (3 a 40 caracteres, solo a-z 0-9 y guiones) */
export function slugify(texto: string): string {
  return texto
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '');
}

export const SLUG_VALIDO = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;
