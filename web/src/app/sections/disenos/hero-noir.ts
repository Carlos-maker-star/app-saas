import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, input, viewChild } from '@angular/core';
import { LandingStore } from '../../core/landing.store';
import { DatosSeccion } from '../../core/models';
import { urlSegura } from '../../core/seguridad';
import { crearResorte, efectosDePuntero } from '../../shared/resorte';

/** Perfumes · Noir: una luz tenue sigue al cursor (con resorte) sobre un titular enorme */
@Component({
  selector: 'app-hero-noir',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #zona class="noi-hero">
      <div #luz class="noi-luz" aria-hidden="true"></div>
      <div class="relative mx-auto grid max-w-6xl items-center gap-8 px-6 py-14 md:grid-cols-[1.1fr_.9fr] md:py-20">
        <div>
          @if (d().etiqueta) { <p class="noi-eye entra" style="--i:0">{{ d().etiqueta }}</p> }
          <h1 class="noi-h1 entra" [class.noi-largo]="largo()" style="--i:1">{{ d().titulo }}</h1>
          @if (d().subtitulo) { <p class="noi-lead entra" style="--i:2">{{ d().subtitulo }}</p> }
          <div class="entra mt-8 flex flex-wrap gap-3" style="--i:3">
            <a class="btn" [href]="wa()" target="_blank" rel="noopener">{{ d().boton?.texto }}</a>
            @if (store.enlaceA('catalogo'); as h) { <a class="btn btn-ghost" [href]="h">Ver colección</a> }
          </div>
        </div>
        <div class="noi-escena entra" style="--i:3">
          @if (img(); as s) { <div class="ph noi-foto"><img [src]="s" alt="" fetchpriority="high"></div> }
          @else {
            <svg class="noi-frasco" viewBox="0 0 120 200" aria-hidden="true">
              <rect x="42" y="6" width="36" height="28" rx="3" fill="var(--brand)"/><rect x="50" y="34" width="20" height="14" fill="var(--brand)"/>
              <rect x="12" y="48" width="96" height="144" rx="14" fill="color-mix(in srgb, var(--accent) 45%, var(--bg))" stroke="var(--brand)" stroke-width="2"/>
              <rect x="30" y="88" width="60" height="58" rx="2" fill="color-mix(in srgb, var(--brand) 14%, transparent)"/><path d="M24 62v112" stroke="#fff" stroke-opacity=".35" stroke-width="5" stroke-linecap="round"/>
            </svg>
          }
          <span class="noi-vt" aria-hidden="true">{{ store.nombre() }}</span>
        </div>
      </div>
    </div>`,
})
export class HeroNoir {
  protected readonly store = inject(LandingStore);
  readonly datos = input.required<DatosSeccion>();
  protected readonly d = computed(() => this.datos());
  protected readonly largo = computed(() => String(this.d()['titulo'] ?? '').length > 14);
  protected readonly img = computed(() => urlSegura(this.d()['imagen']));
  protected readonly wa = computed(() => this.store.wa(this.d()['boton']?.mensaje ?? 'Hola, quisiera más información.'));
  private readonly zona = viewChild.required<ElementRef<HTMLElement>>('zona');
  private readonly luz = viewChild.required<ElementRef<HTMLElement>>('luz');

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      if (!efectosDePuntero()) return;
      const zona = this.zona().nativeElement, luz = this.luz().nativeElement;
      // la luz es una capa propia que solo cambia de posición (transform): no recalcula el resto de la página
      const r = crearResorte((x, y) => { luz.style.transform = `translate3d(${x}px,${y}px,0)`; }, 0.07);
      const mover = (e: Event) => { const p = e as PointerEvent; const b = zona.getBoundingClientRect(); r.ir(p.clientX - b.left, p.clientY - b.top); };
      zona.addEventListener('pointermove', mover);
      destroy.onDestroy(() => { zona.removeEventListener('pointermove', mover); r.parar(); });
    });
  }
}
