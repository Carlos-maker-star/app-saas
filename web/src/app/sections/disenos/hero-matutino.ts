import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, input, viewChild } from '@angular/core';
import { LandingStore } from '../../core/landing.store';
import { DatosSeccion } from '../../core/models';
import { urlSegura } from '../../core/seguridad';
import { resaltar } from '../../core/texto';
import { crearResorte, efectosDePuntero } from '../../shared/resorte';
import { cintaDe } from './cinta';

/** Cafetería · Matutino: letras enormes, formas de color que reaccionan al cursor y una cinta en movimiento */
@Component({
  selector: 'app-hero-matutino',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto grid max-w-6xl items-center gap-8 px-6 pb-20 pt-8 md:grid-cols-[1.2fr_.8fr]">
      <div>
        <h1 class="mat-h1 entra" style="--i:0">{{ t().antes }} @if (t().resalte) { <span class="mat-hl">{{ t().resalte }}</span> }</h1>
        @if (d().subtitulo) { <p class="mat-lead entra" style="--i:1">{{ d().subtitulo }}</p> }
        @if (d().etiqueta) { <p class="mat-etq entra" style="--i:2">{{ d().etiqueta }}</p> }
        <div class="entra mt-7 flex flex-wrap items-center gap-3" style="--i:2">
          <a class="btn" [href]="wa()" target="_blank" rel="noopener">{{ d().boton?.texto }}</a>
          @if (store.enlaceA('catalogo'); as h) { <a class="btn mat-btn2" [href]="h">Ver carta</a> }
        </div>
      </div>

      <div #comp class="mat-comp entra" style="--i:3">
        <div class="mat-s1" data-k="14"></div><div class="mat-s2" data-k="-10"></div><div class="mat-s3" data-k="8"></div>
        @if (img(); as s) { <div class="mat-foto ph" data-k="-18"><img [src]="s" alt="" fetchpriority="high"></div> }
        @else {
          <svg class="mat-taza" viewBox="0 0 120 120" fill="none" data-k="-18" aria-hidden="true">
            <path d="M20 44h62v26a28 28 0 0 1-28 28h-6A28 28 0 0 1 20 70V44Z" fill="currentColor"/><path d="M82 52h9a11 11 0 0 1 0 24h-10" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><ellipse cx="51" cy="44" rx="31" ry="7" fill="var(--bg)"/>
          </svg>
        }
      </div>
    </div>
    <div class="mat-cinta" aria-hidden="true">
      <!-- dos copias idénticas: al desplazarse -50% el bucle es continuo -->
      <div [style.animation-duration.s]="cinta().length * 2.2">
        @for (w of cinta(); track $index) { <span>{{ w }}</span><span>✺</span> }
        @for (w of cinta(); track $index) { <span>{{ w }}</span><span>✺</span> }
      </div>
    </div>`,
})
export class HeroMatutino {
  protected readonly store = inject(LandingStore);
  readonly datos = input.required<DatosSeccion>();
  protected readonly d = computed(() => this.datos());
  protected readonly t = computed(() => resaltar(this.d()['titulo'], 2));
  protected readonly img = computed(() => urlSegura(this.d()['imagen']));
  protected readonly wa = computed(() => this.store.wa(this.d()['boton']?.mensaje ?? 'Hola, quisiera más información.'));
  protected readonly cinta = computed(() => cintaDe(this.store, this.d(), ['Café de especialidad', 'Pan de masa madre', 'Desayunos todo el día']));
  private readonly comp = viewChild.required<ElementRef<HTMLElement>>('comp');

  constructor() {
    const destroy = inject(DestroyRef);
    // Las formas siguen al cursor con un resorte (decorativo): solo con ratón y sin «reducir movimiento»
    afterNextRender(() => {
      if (!efectosDePuntero()) return;
      const el = this.comp().nativeElement;
      const capas = [...el.querySelectorAll<HTMLElement>('[data-k]')];
      const r = crearResorte((x, y) => capas.forEach((c) => { const k = +(c.dataset['k'] ?? 0) / 100; c.style.transform = `translate3d(${x * k}px,${y * k}px,0)`; }), 0.08);
      const mover = (e: Event) => { const p = e as PointerEvent; const b = el.getBoundingClientRect(); r.ir(p.clientX - (b.left + b.width / 2), p.clientY - (b.top + b.height / 2)); };
      const zona = el.closest('[data-sec]') ?? el;
      zona.addEventListener('pointermove', mover);
      destroy.onDestroy(() => { zona.removeEventListener('pointermove', mover); r.parar(); });
    });
  }
}
