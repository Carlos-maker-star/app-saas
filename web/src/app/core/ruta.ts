/** Lee un valor anidado: getRuta({boton:{texto:'Hola'}}, 'boton.texto') → 'Hola'. Admite índices: 'dias.0.hora'. */
export function getRuta(obj: unknown, ruta: string): unknown {
  return ruta.split('.').reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj);
}

/** Devuelve una copia con el valor cambiado (sin mutar el original). Crea los niveles que falten. */
export function setRuta<T>(obj: T, ruta: string, valor: unknown): T {
  const [k, ...resto] = ruta.split('.');
  const base: unknown = Array.isArray(obj) ? [...obj] : { ...((obj ?? {}) as object) };
  const actual = (base as Record<string, unknown>)[k];
  (base as Record<string, unknown>)[k] = resto.length
    ? setRuta(actual ?? (/^\d+$/.test(resto[0]) ? [] : {}), resto.join('.'), valor)
    : valor;
  return base as T;
}
