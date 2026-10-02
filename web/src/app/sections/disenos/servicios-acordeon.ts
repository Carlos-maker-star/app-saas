import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { precio } from '../../core/format';
import { LandingStore } from '../../core/landing.store';
import { DatosSeccion, Item } from '../../core/models';

/** Salud · Cálido: especialidades como acordeón (una abierta a la vez) */
@Component({
  selector: 'app-servicios-acordeon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length) {
      <section class="mx-auto max-w-6xl px-6 py-14">
        <div class="hum-esp">
          <div>
            <h2 class="hum-h2">{{ datos()['titulo'] }}</h2>
            <p class="hum-sub">Elige una para ver en qué podemos ayudarte.</p>
            <a class="btn" [href]="store.wa('Hola, quisiera agendar una cita.')" target="_blank" rel="noopener">Reservar mi cita</a>
          </div>
          <div class="hum-acc st">
            @for (i of items(); track i.id) {
              <div class="hum-it" [attr.data-o]="abierto() === i.id">
                <button type="button" [attr.aria-expanded]="abierto() === i.id" [attr.aria-controls]="'ac-' + i.id" (click)="alternar(i.id)">
                  <span>{{ i.nombre }}</span><i aria-hidden="true"></i>
                </button>
                <div class="hum-p" [id]="'ac-' + i.id" role="region">
                  <div>
                    <p>{{ i.descripcion }}@if (i.precio !== null) { <b> · {{ fmt(i) }}</b> }</p>
                    <a class="hum-link" [href]="pedir(i)" target="_blank" rel="noopener">{{ datos()['boton_item'] ?? 'Consultar' }} →</a>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </section>
    }`,
})
export class ServiciosAcordeon {
  protected readonly store = inject(LandingStore);
  readonly datos = input.required<DatosSeccion>();
  protected readonly items = computed(() => this.store.itemsDe('servicio'));
  protected readonly abierto = signal('');
  protected fmt = (i: Item) => precio(i.precio, this.datos()['moneda'] ?? 'S/');
  protected pedir = (i: Item) => this.store.wa(this.datos()['mensaje_item'] ?? 'Hola, quisiera consultar: {nombre}', i.nombre);

  protected alternar(id: string): void {
    this.abierto.update((a) => (a === id ? '' : id));
  }
}
