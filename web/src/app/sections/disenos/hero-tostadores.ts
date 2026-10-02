import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LandingStore } from '../../core/landing.store';
import { DatosSeccion } from '../../core/models';
import { urlSegura } from '../../core/seguridad';
import { resaltar } from '../../core/texto';

/** Cafetería · Tostadores: papel kraft y etiqueta de bolsa con sello giratorio */
@Component({
  selector: 'app-hero-tostadores',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto grid max-w-6xl items-center gap-12 px-6 py-14 md:grid-cols-[1.15fr_.85fr] md:py-20">
      <div>
        @if (d().etiqueta) { <p class="tos-lab entra" style="--i:0">{{ d().etiqueta }}</p> }
        <h1 class="tos-h1 entra" style="--i:1">{{ t().antes }} @if (t().resalte) { <em>{{ t().resalte }}</em> }</h1>
        @if (d().subtitulo) { <p class="tos-lead entra" style="--i:2">{{ d().subtitulo }}</p> }
        <div class="entra mt-8 flex flex-wrap gap-3" style="--i:3">
          <a class="btn" [href]="wa()" target="_blank" rel="noopener">{{ d().boton?.texto }}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg></a>
          @if (store.enlaceA('catalogo'); as h) { <a class="btn btn-ghost" [href]="h">Ver carta</a> }
        </div>
      </div>

      <div class="tos-label entra" style="--i:3">
        <svg class="tos-stamp" viewBox="0 0 100 100" aria-hidden="true">
          <defs><path id="tos-c" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0"/></defs>
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="2"/>
          <text><textPath href="#tos-c" textLength="236" lengthAdjust="spacing">ORIGEN ÚNICO · TUESTE MEDIO · LOTE FRESCO ·</textPath></text>
        </svg>
        @if (img(); as s) { <div class="ph tos-foto"><img [src]="s" alt="" fetchpriority="high"></div> }
        <p class="tos-no">{{ d().ficha_subtitulo || 'Café en grano' }}</p>
        <h3 class="tos-ft">{{ d().ficha_titulo || store.nombre() }}</h3>
        @for (f of ficha(); track $index) { <div class="tos-kv"><span>{{ f.clave }}</span><b>{{ f.valor }}</b></div> }
        <div class="tos-bars" aria-hidden="true"></div>
      </div>
    </div>`,
})
export class HeroTostadores {
  protected readonly store = inject(LandingStore);
  readonly datos = input.required<DatosSeccion>();
  protected readonly d = computed(() => this.datos());
  protected readonly t = computed(() => resaltar(this.d()['titulo'], 1));
  protected readonly img = computed(() => urlSegura(this.d()['imagen']));
  protected readonly wa = computed(() => this.store.wa(this.d()['boton']?.mensaje ?? 'Hola, quisiera más información.'));
  protected readonly ficha = computed<{ clave: string; valor: string }[]>(() => (this.d()['ficha'] ?? []).filter((f: { clave?: string }) => f?.clave));
}
