import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';

const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Aparición al hacer scroll (el estilo depende del rubro: ver styles.css).
 * Todo ocurre solo en el navegador: el HTML que genera el servidor (y que lee Google) lleva el
 * contenido visible; lo que ya está en pantalla se queda como está y solo lo de más abajo se anima.
 */
@Directive({ selector: '[appReveal]' })
export class Reveal {
  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      if (reducido() || !('IntersectionObserver' in window)) return;
      if (el.getBoundingClientRect().top < innerHeight * 0.95) {
        el.classList.add('reveal', 'in'); // ya visible: sin animación ni parpadeo
        return;
      }
      el.classList.add('reveal');
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          el.classList.add('in');
          io.disconnect();
        }
      }, { threshold: 0.08 });
      io.observe(el);
      destroy.onDestroy(() => io.disconnect());
    });
  }
}

/** Cuenta de 0 al valor cuando el elemento entra en pantalla. */
@Directive({ selector: '[appCount]' })
export class CountUp {
  readonly appCount = input.required<number>();

  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      const fin = this.appCount();
      if (reducido() || !('IntersectionObserver' in window)) return;
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const paso = (t: number) => {
          const p = Math.min((t - t0) / 1400, 1);
          el.textContent = String(Math.round(fin * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(paso);
        };
        requestAnimationFrame(paso);
      });
      io.observe(el);
      destroy.onDestroy(() => io.disconnect());
    });
  }
}
