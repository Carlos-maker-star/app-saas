import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LandingStore } from '../core/landing.store';
import { DatosSeccion } from '../core/models';

/** Cierre con llamado a la acción: franja de color de marca */
@Component({
  selector: 'app-contacto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="contacto bg-brand px-6 py-16 text-center text-on-brand">
      <h2 class="h2">{{ datos()['titulo'] }}</h2>
      @if (datos()['texto']) { <p class="mt-2 opacity-90">{{ datos()['texto'] }}</p> }
      <a class="btn btn-inv shine mt-6" [href]="wa()" target="_blank" rel="noopener">{{ datos()['boton'] ?? 'Escribir por WhatsApp' }}</a>
    </section>`,
})
export class Contacto {
  private readonly store = inject(LandingStore);
  readonly datos = input.required<DatosSeccion>();
  protected readonly wa = computed(() => this.store.wa(this.datos()['mensaje'] ?? 'Hola, quisiera más información.'));
}
