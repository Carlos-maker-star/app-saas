import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LandingStore } from '../../core/landing.store';
import { DatosSeccion } from '../../core/models';
import { urlSegura } from '../../core/seguridad';
import { resaltar } from '../../core/texto';

/** Salud · Cálido: foto en arco sobre una mancha que «respira», con una tarjeta de reseñas */
@Component({
  selector: 'app-hero-calido',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto grid max-w-6xl items-center gap-8 px-6 pb-14 pt-8 md:grid-cols-[1.1fr_.9fr]">
      <div>
        @if (d().etiqueta) { <span class="hum-pill entra" style="--i:0">● {{ d().etiqueta }}</span> }
        <h1 class="hum-h1 entra" style="--i:1">{{ t().antes }} @if (t().resalte) { <em>{{ t().resalte }}</em> }</h1>
        @if (d().subtitulo) { <p class="hum-lead entra" style="--i:2">{{ d().subtitulo }}</p> }
        <div class="entra mt-7 flex flex-wrap gap-3" style="--i:3">
          <a class="btn" [href]="wa()" target="_blank" rel="noopener">{{ d().boton?.texto }}</a>
          @if (store.enlaceA('equipo'); as h) { <a class="btn btn-ghost" [href]="h">Conocer al equipo</a> }
        </div>
      </div>
      <div class="hum-arco entra" style="--i:3">
        <div class="hum-mancha" aria-hidden="true"></div>
        <div class="hum-marco ph">
          @if (img(); as s) { <img [src]="s" alt="" fetchpriority="high"> }
          @else {
            <svg viewBox="0 0 120 150" aria-hidden="true"><circle cx="60" cy="48" r="26" fill="#fff" opacity=".9"/><path d="M8 150c0-34 22-56 52-56s52 22 52 56Z" fill="#fff" opacity=".9"/>
              <path d="M60 100v22M49 111h22" stroke="var(--brand)" stroke-width="5" stroke-linecap="round" opacity=".55"/></svg>
          }
        </div>
        @if (d().rating) { <div class="hum-tick"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"/></svg><b>{{ d().rating }}</b></div> }
      </div>
    </div>`,
})
export class HeroCalido {
  protected readonly store = inject(LandingStore);
  readonly datos = input.required<DatosSeccion>();
  protected readonly d = computed(() => this.datos());
  protected readonly t = computed(() => resaltar(this.d()['titulo'], 3));
  protected readonly img = computed(() => urlSegura(this.d()['imagen']));
  protected readonly wa = computed(() => this.store.wa(this.d()['boton']?.mensaje ?? 'Hola, quisiera más información.'));
}
