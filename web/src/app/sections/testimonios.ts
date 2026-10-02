import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatosSeccion } from '../core/models';

@Component({
  selector: 'app-testimonios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length) {
      <section class="mx-auto max-w-6xl px-6 py-14">
        <h2 class="h2">{{ datos()['titulo'] ?? 'Opiniones' }}</h2>
        <div class="st mt-8 grid gap-4 md:grid-cols-3">
          @for (t of items(); track $index) {
            <blockquote class="tst-q rounded-2xl bg-soft p-6">“{{ t.texto }}”
              <footer class="mt-3 text-sm font-semibold">— {{ t.nombre }}</footer>
            </blockquote>
          }
        </div>
      </section>
    }`,
})
export class Testimonios {
  readonly datos = input.required<DatosSeccion>();
  protected readonly items = computed<{ texto: string; nombre: string }[]>(() => this.datos()['items'] ?? []);
}
