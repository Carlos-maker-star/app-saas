import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LandingStore } from '../../core/landing.store';
import { DatosSeccion } from '../../core/models';
import { urlSegura } from '../../core/seguridad';
import { lineas } from '../../core/texto';

/** Barbería · Calle: tres palabras enormes que se destapan una tras otra, sticker y botones que se hunden */
@Component({
  selector: 'app-hero-calle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto grid max-w-6xl items-end gap-8 px-6 pb-8 pt-10 md:grid-cols-[1.4fr_1fr]">
      <h1 class="cal-h1">
        @for (l of lineas(); track $index) { <span class="cal-w" [class]="'cal-w cal-w' + $index" [style.--i]="$index">{{ l }}</span> }
      </h1>
      <div class="cal-side entra" style="--i:3">
        @if (d().etiqueta) { <span class="cal-sticker">{{ d().etiqueta }}</span> }
        @if (d().subtitulo) { <p>{{ d().subtitulo }}</p> }
        @if (img(); as s) { <div class="ph cal-foto"><img [src]="s" alt="" fetchpriority="high"></div> }
        <a class="btn" [href]="wa()" target="_blank" rel="noopener">{{ d().boton?.texto }} →</a>
      </div>
    </div>`,
})
export class HeroCalle {
  private readonly store = inject(LandingStore);
  readonly datos = input.required<DatosSeccion>();
  protected readonly d = computed(() => this.datos());
  protected readonly lineas = computed(() => lineas(this.d()['titulo'], 3));
  protected readonly img = computed(() => urlSegura(this.d()['imagen']));
  protected readonly wa = computed(() => this.store.wa(this.d()['boton']?.mensaje ?? 'Hola, quisiera más información.'));
}
