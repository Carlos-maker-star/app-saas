/**
 * Interpolación tipo resorte hacia un objetivo (para movimientos decorativos que siguen al cursor).
 * Devuelve una función `ir(x, y)` que fija el objetivo; el valor actual se acerca en cada fotograma
 * y el bucle se detiene solo cuando llega, así no gasta nada en reposo.
 */
export function crearResorte(aplicar: (x: number, y: number) => void, k = 0.12): { ir: (x: number, y: number) => void; parar: () => void } {
  let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
  const paso = () => {
    x += (tx - x) * k;
    y += (ty - y) * k;
    aplicar(x, y);
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.1 ? requestAnimationFrame(paso) : 0;
  };
  return {
    ir(nx, ny) { tx = nx; ty = ny; if (!raf) raf = requestAnimationFrame(paso); },
    parar() { if (raf) cancelAnimationFrame(raf); raf = 0; },
  };
}

/** Puntero fino (ratón) y sin «reducir movimiento»: solo entonces se activan los efectos que siguen al cursor */
export const efectosDePuntero = (): boolean =>
  matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
