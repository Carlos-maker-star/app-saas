import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LandingStore } from '../../core/landing.store';
import { DatosSeccion } from '../../core/models';
import { urlSegura } from '../../core/seguridad';
import { resaltar } from '../../core/texto';

/** Perfumes · Laboratorio: titular editorial y un dibujo botánico que se traza solo */
@Component({
  selector: 'app-hero-laboratorio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lab-hero">
      <div class="lab-izq">
        @if (d().etiqueta) { <span class="lab-tag entra" style="--i:0">{{ d().etiqueta }}</span> }
        <h1 class="lab-h1 entra" style="--i:1">{{ t().antes }} @if (t().resalte) { <em>{{ t().resalte }}</em> }</h1>
        @if (d().subtitulo) { <p class="lab-lead entra" style="--i:2">{{ d().subtitulo }}</p> }
        <div class="entra mt-7 flex flex-wrap gap-3" style="--i:3">
          <a class="btn" [href]="wa()" target="_blank" rel="noopener">{{ d().boton?.texto }}</a>
          @if (store.enlaceA('catalogo'); as h) { <a class="btn btn-ghost" [href]="h">Ver catálogo</a> }
        </div>
      </div>
      <div class="lab-der">
        @if (img(); as s) { <div class="ph lab-foto"><img [src]="s" alt="" fetchpriority="high"></div> }
        @else {
          <svg viewBox="0 0 200 260" aria-hidden="true">
            <path pathLength="1" style="--k:0" d="M100 250C100 190 98 130 104 40"/>
            <path pathLength="1" class="ac" style="--k:1" d="M104 40C128 56 142 82 138 110C112 104 102 74 104 40Z"/>
            <path pathLength="1" style="--k:2" d="M101 130C74 128 56 108 54 80C80 82 98 100 101 130Z"/>
            <path pathLength="1" style="--k:3" d="M100 180C128 176 148 158 150 130C124 132 104 150 100 180Z"/>
            <path pathLength="1" style="--k:4" d="M99 215C74 212 58 196 56 172C80 174 96 190 99 215Z"/>
            <path pathLength="1" class="ac" style="--k:5" d="M104 40c-2-12 2-24 12-30"/>
          </svg>
        }
        <span class="lab-cap">Fig. 1 — {{ store.nombre() }}</span>
      </div>
    </div>`,
})
export class HeroLaboratorio {
  protected readonly store = inject(LandingStore);
  readonly datos = input.required<DatosSeccion>();
  protected readonly d = computed(() => this.datos());
  protected readonly t = computed(() => resaltar(this.d()['titulo'], 2));
  protected readonly img = computed(() => urlSegura(this.d()['imagen']));
  protected readonly wa = computed(() => this.store.wa(this.d()['boton']?.mensaje ?? 'Hola, quisiera más información.'));
}
