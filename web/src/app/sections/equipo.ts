import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LandingStore } from '../core/landing.store';
import { DatosSeccion, Item } from '../core/models';
import { urlSegura } from '../core/seguridad';

@Component({
  selector: 'app-equipo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length) {
      <section class="bg-surface">
        <div class="mx-auto max-w-6xl px-6 py-14">
          <h2 class="h2">{{ datos()['titulo'] }}</h2>
          <div class="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
            @for (i of items(); track i.id) {
              <article class="overflow-hidden rounded-[var(--radius)] border border-line bg-bg">
                <div class="ph aspect-[4/5]">@if (imagen(i); as s) { <img [src]="s" [alt]="i.nombre" loading="lazy"> }</div>
                <div class="p-4">
                  <h3 class="text-lg font-semibold">{{ i.nombre }}</h3>
                  @if (i.descripcion) { <p class="text-sm text-mute">{{ i.descripcion }}</p> }
                </div>
              </article>
            }
          </div>
        </div>
      </section>
    }`,
})
export class Equipo {
  private readonly store = inject(LandingStore);
  readonly datos = input.required<DatosSeccion>();
  protected readonly items = computed(() => this.store.itemsDe('miembro'));
  protected imagen = (i: Item) => urlSegura(i.imagen_url);
}
