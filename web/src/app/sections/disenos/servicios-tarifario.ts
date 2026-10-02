import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { precio } from '../../core/format';
import { LandingStore } from '../../core/landing.store';
import { DatosSeccion, Item } from '../../core/models';

/**
 * Barbería · Poste clásico: tarifario donde el cliente marca los servicios que quiere y se arma su mensaje
 * de WhatsApp con el total. El mensaje usa el texto del dueño (con {nombre} = los servicios elegidos).
 */
@Component({
  selector: 'app-servicios-tarifario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length) {
      <section class="pos-tarifa">
        <div class="mx-auto grid max-w-6xl items-start gap-10 px-6 py-14 md:grid-cols-[1.25fr_1fr]">
          <div>
            <h2 class="pos-h2">{{ datos()['titulo'] }}</h2>
            <p class="pos-sub">Toca los servicios que quieres y arma tu mensaje.</p>
            <div class="st">
              @for (i of items(); track i.id) {
                <button type="button" class="pos-sv" [attr.aria-pressed]="elegido(i.id)" (click)="alternar(i.id)">
                  <span class="pos-ck" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 8.5l3.2 3L13 4.5"/></svg></span>
                  <span class="pos-sn">{{ i.nombre }}@if (i.descripcion) { <small>{{ i.descripcion }}</small> }</span>
                  <span class="pos-d"></span>
                  @if (i.precio !== null) { <b>{{ fmt(i) }}</b> }
                </button>
              }
            </div>
          </div>
          <div class="pos-stub">
            <span class="pos-lab2">Tu turno</span>
            <b class="pos-total">{{ total() }}</b>
            <hr>
            <p class="pos-msg" [class.sw]="cambiando()">{{ resumen() }}</p>
            <a class="btn pos-wa" [class.pos-off]="!elegidos().length" [href]="wa()" target="_blank" rel="noopener"
               [attr.aria-disabled]="!elegidos().length">{{ datos()['boton_item'] ?? 'Reservar' }} por WhatsApp</a>
          </div>
        </div>
      </section>
    }`,
})
export class ServiciosTarifario {
  private readonly store = inject(LandingStore);
  readonly datos = input.required<DatosSeccion>();
  protected readonly items = computed(() => this.store.itemsDe('servicio'));
  private readonly ids = signal<string[] | null>(null);
  protected readonly cambiando = signal(false);

  /** Por defecto está marcado el primer servicio, como ejemplo de cómo funciona */
  protected readonly elegidos = computed(() => {
    const todos = this.items();
    const ids = this.ids() ?? (todos[0] ? [todos[0].id] : []);
    return todos.filter((i) => ids.includes(i.id));
  });
  protected readonly total = computed(() => {
    const t = this.elegidos().reduce((s, i) => s + (i.precio ?? 0), 0);
    return t ? precio(t, this.datos()['moneda'] ?? 'S/') : '—';
  });
  protected readonly nombres = computed(() => this.elegidos().map((i) => i.nombre).join(' + '));
  private readonly mensaje = computed(() =>
    (this.datos()['mensaje_item'] ?? 'Hola, quisiera reservar: {nombre}').replaceAll('{nombre}', this.nombres()));
  protected readonly resumen = computed(() => (this.elegidos().length ? this.mensaje() : 'Elige al menos un servicio para armar tu mensaje.'));
  protected readonly wa = computed(() => this.store.wa(this.mensaje()));

  protected fmt = (i: Item) => precio(i.precio, this.datos()['moneda'] ?? 'S/');
  protected elegido = (id: string) => this.elegidos().some((i) => i.id === id);

  protected alternar(id: string): void {
    const actual = this.elegidos().map((i) => i.id);
    this.cambiando.set(true); // desenfoque corto: oculta el salto entre dos textos
    setTimeout(() => {
      this.ids.set(actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]);
      this.cambiando.set(false);
    }, 110);
  }
}
