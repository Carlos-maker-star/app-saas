import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatosSeccion } from '../core/models';

@Component({
  selector: 'app-faq',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length) {
      <section class="mx-auto max-w-3xl px-6 py-14">
        <h2 class="h2">{{ datos()['titulo'] ?? 'Preguntas frecuentes' }}</h2>
        <div class="mt-6 space-y-3">
          @for (p of items(); track p.pregunta) {
            <details class="rounded-2xl border border-line bg-surface p-5">
              <summary class="fd flex justify-between font-semibold">{{ p.pregunta }}<span class="plus" aria-hidden="true">+</span></summary>
              <p class="mt-3 text-sm text-mute">{{ p.respuesta }}</p>
            </details>
          }
        </div>
      </section>
    }`,
})
export class Faq {
  readonly datos = input.required<DatosSeccion>();
  protected readonly items = computed<{ pregunta: string; respuesta: string }[]>(() => this.datos()['items'] ?? []);
}
