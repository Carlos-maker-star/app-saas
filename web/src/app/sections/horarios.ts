import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LandingStore } from '../core/landing.store';
import { enlaceMapa } from '../core/seguridad';
import { DatosSeccion } from '../core/models';

/** Horarios + dirección con enlace a Google Maps */
@Component({
  selector: 'app-horarios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (dias().length || store.direccion()) {
      <section class="mx-auto max-w-6xl px-6 py-14">
        <div class="grid gap-6 md:grid-cols-2">
          <div class="rounded-[var(--radius)] border border-line bg-surface p-7">
            <h2 class="text-2xl font-semibold">{{ datos()['titulo'] ?? 'Horarios' }}</h2>
            <div class="mt-4 space-y-2">
              @for (d of dias(); track d.dia) {
                <div class="leader"><span>{{ d.dia }}</span><i></i><b>{{ d.hora }}</b></div>
              }
            </div>
          </div>
          @if (store.direccion()) {
            <div class="flex flex-col justify-center rounded-[var(--radius)] border border-line p-7">
              <h2 class="text-2xl font-semibold">Visítanos</h2>
              <p class="mt-2 text-mute">{{ store.direccion() }}</p>
              @if (mapa(); as m) { <a class="btn btn-ghost mt-5 self-start" [href]="m" target="_blank" rel="noopener">Cómo llegar</a> }
            </div>
          }
        </div>
      </section>
    }`,
})
export class Horarios {
  protected readonly store = inject(LandingStore);
  readonly datos = input.required<DatosSeccion>();
  protected readonly dias = computed<{ dia: string; hora: string }[]>(() => this.datos()['dias'] ?? []);
  protected readonly mapa = computed(() => enlaceMapa(this.store.direccion()));
}
