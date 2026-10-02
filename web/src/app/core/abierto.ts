/**
 * ¿El negocio está abierto ahora? Se deduce de los horarios que escribió el dueño
 * ("Lun – Vie · 7:00 – 21:00"). Si no se entienden, devuelve null y no se muestra nada.
 */

export interface EstadoApertura { abierto: boolean; texto: string; }

const DIAS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];

const sinTildes = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Días que cubre un texto como "Lun – Vie", "Sábado" o "Sáb - Dom" (0 = domingo) */
export function diasDe(texto: string): number[] {
  const t = sinTildes(texto);
  const nombres = [...t.matchAll(/\b(dom|lun|mar|mie|jue|vie|sab)[a-z]*/g)].map((m) => DIAS.indexOf(m[1]));
  if (!nombres.length) return /todos|diario/.test(t) ? [0, 1, 2, 3, 4, 5, 6] : [];
  if (nombres.length === 1) return nombres;
  // rango "lun – vie": se recorre de un día al otro (puede cruzar el domingo: "vie – lun")
  const [a, b] = [nombres[0], nombres[nombres.length - 1]];
  const dias: number[] = [];
  for (let d = a; ; d = (d + 1) % 7) { dias.push(d); if (d === b || dias.length > 7) break; }
  return dias;
}

/** "7:00 – 21:00", "8 am - 10 pm" → minutos desde la medianoche; null si no es un horario */
export function rango(texto: string): [number, number] | null {
  const m = sinTildes(texto).match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|—|a|hasta)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!m) return null;
  const hora = (h: string, min: string | undefined, ampm: string | undefined) => {
    let n = +h;
    if (ampm === 'pm' && n < 12) n += 12;
    if (ampm === 'am' && n === 12) n = 0;
    return n * 60 + (min ? +min : 0);
  };
  const fin = hora(m[4], m[5], m[6]);
  return [hora(m[1], m[2], m[3]), fin];
}

const formato = (min: number) => {
  const h = Math.floor(min / 60) % 24;
  return `${h % 12 || 12}${min % 60 ? ':' + String(min % 60).padStart(2, '0') : ''} ${h >= 12 ? 'pm' : 'am'}`;
};

export function abiertoAhora(dias: { dia: string; hora: string }[], ahora: Date = new Date()): EstadoApertura | null {
  const hoy = ahora.getDay();
  const min = ahora.getHours() * 60 + ahora.getMinutes();
  let entendido = false;
  for (const fila of dias) {
    if (!diasDe(fila.dia).includes(hoy)) continue;
    entendido = true;
    if (/cerrado/i.test(fila.hora)) return { abierto: false, texto: 'Cerrado hoy' };
    const r = rango(fila.hora);
    if (!r) continue;
    const [ini, fin] = r;
    const abierto = fin > ini ? min >= ini && min < fin : min >= ini || min < fin; // el horario puede cruzar la medianoche
    return abierto ? { abierto, texto: `Abierto ahora · cierra ${formato(fin)}` } : { abierto, texto: min < ini ? `Cerrado · abre a las ${formato(ini)}` : 'Cerrado por hoy' };
  }
  return entendido ? { abierto: false, texto: 'Cerrado hoy' } : null;
}
