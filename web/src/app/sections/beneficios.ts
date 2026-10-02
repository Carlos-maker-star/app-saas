import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatosSeccion } from '../core/models';

@Component({
  selector: 'app-beneficios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length) {
      <section class="border-y border-line">
        <div class="ben-grid st mx-auto grid max-w-6xl gap-10 px-6 py-14 text-center md:grid-cols-3">
          @for (b of items(); track b.titulo) {
            <div><h3 class="text-3xl">{{ b.titulo }}</h3><p class="mt-2 text-sm text-mute">{{ b.texto }}</p></div>
          }
        </div>
      </section>
    }`,
})
export class Beneficios {
  readonly datos = input.required<DatosSeccion>();
  protected readonly items = computed<{ titulo: string; texto: string }[]>(() => this.datos()['items'] ?? []);
}
