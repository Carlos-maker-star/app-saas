import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LandingStore } from '../../core/landing.store';
import { DatosSeccion } from '../../core/models';
import { urlSegura } from '../../core/seguridad';
import { resaltar } from '../../core/texto';

/** Barbería · Poste clásico: poste de barbero animado junto al titular */
@Component({
  selector: 'app-hero-poste',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pos-rib" aria-hidden="true"></div>
    <div class="mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 md:grid-cols-[5.5rem_1fr_minmax(0,.7fr)] md:py-16">
      <div class="pos-polo entra" style="--i:0" aria-hidden="true"><span class="pos-cap"></span><div class="pos-tubo"><div></div></div><span class="pos-cap"></span></div>
      <div>
        @if (d().etiqueta) { <p class="pos-lab entra" style="--i:0">{{ d().etiqueta }}</p> }
        <h1 class="pos-h1 entra" style="--i:1">{{ t().antes }} @if (t().resalte) { <em>{{ t().resalte }}</em> }</h1>
        @if (d().subtitulo) { <p class="pos-lead entra" style="--i:2">{{ d().subtitulo }}</p> }
        <div class="entra mt-7 flex flex-wrap gap-3" style="--i:3">
          <a class="btn" [href]="wa()" target="_blank" rel="noopener">{{ d().boton?.texto }}</a>
          @if (store.enlaceA('servicios'); as h) { <a class="btn btn-ghost" [href]="h">Ver servicios</a> }
        </div>
      </div>
      @if (img(); as s) { <div class="ph pos-foto entra hidden md:block" style="--i:3"><img [src]="s" alt="" fetchpriority="high"></div> }
    </div>`,
})
export class HeroPoste {
  protected readonly store = inject(LandingStore);
  readonly datos = input.required<DatosSeccion>();
  protected readonly d = computed(() => this.datos());
  protected readonly t = computed(() => resaltar(this.d()['titulo'], 2));
  protected readonly img = computed(() => urlSegura(this.d()['imagen']));
  protected readonly wa = computed(() => this.store.wa(this.d()['boton']?.mensaje ?? 'Hola, quisiera más información.'));
}
