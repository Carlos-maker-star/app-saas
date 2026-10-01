import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LandingStore } from '../core/landing.store';
import { DatosSeccion } from '../core/models';
import { urlSegura } from '../core/seguridad';

@Component({
  selector: 'app-galeria',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (fotos().length || store.demo()) {
      <section class="mx-auto max-w-6xl px-6 py-14">
        <h2 class="h2">{{ datos()['titulo'] }}</h2>
        <div class="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
          @for (f of fotos(); track $index) {
            <div class="ph zoomable aspect-[4/5] rounded-[var(--radius)] md:[&:nth-child(3n+2)]:mt-8">
              @if (f) { <img [src]="f" alt="" loading="lazy"> }
            </div>
          }
        </div>
      </section>
    }`,
})
export class Galeria {
  protected readonly store = inject(LandingStore);
  readonly datos = input.required<DatosSeccion>();
  /** Fotos reales; en las demos, 3 recuadros de muestra */
  protected readonly fotos = computed<(string | null)[]>(() => {
    const reales = ((this.datos()['imagenes'] ?? []) as unknown[]).map(urlSegura).filter((u): u is string => !!u);
    return reales.length || !this.store.demo() ? reales : [null, null, null];
  });
}
