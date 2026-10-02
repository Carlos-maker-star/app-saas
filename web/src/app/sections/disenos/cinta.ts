import { LandingStore } from '../../core/landing.store';
import { DatosSeccion } from '../../core/models';
import { lista } from '../../core/texto';

/**
 * Palabras de la cinta que se mueve: las que escribió el dueño; si no, los nombres de sus servicios o
 * productos; si no, unas por defecto. Se repiten hasta tener al menos 14 para que siempre llene el ancho
 * (con pocas palabras la cinta quedaba vacía y daba saltos).
 */
export function cintaDe(store: LandingStore, datos: DatosSeccion, porDefecto: string[]): string[] {
  const propias = lista(datos['cinta']);
  const items = store.itemsDe('servicio').length ? store.itemsDe('servicio') : store.itemsDe('producto');
  const nombres = items.map((i) => i.nombre.trim()).filter(Boolean);
  const base = propias.length ? propias : nombres.length ? [...new Set(nombres)].slice(0, 6) : porDefecto;
  return Array.from({ length: Math.max(14, base.length) }, (_, i) => base[i % base.length]);
}
