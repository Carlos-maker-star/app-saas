import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LandingStore } from '../core/landing.store';
import { DatosSeccion, Item } from '../core/models';
import { precio } from '../core/format';

/** Servicios. Barbería: lista numerada con precio. Resto: tarjetas con icono. */
@Component({
  selector: 'app-servicios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length) {
      <section class="mx-auto max-w-6xl px-6 py-14">
        <h2 class="h2">{{ datos()['titulo'] }}</h2>

        @if (numerada()) {
          <ol class="mt-8 max-w-3xl border-b border-line">
            @for (i of items(); track i.id; let n = $index) {
              <li class="flex items-center gap-4 border-t border-line py-5 transition-[padding,background] hover:bg-surface hover:pl-3">
                <span class="fd w-12 text-3xl text-brand">{{ n + 1 < 10 ? '0' + (n + 1) : n + 1 }}</span>
                <div class="flex-1">
                  <h3 class="text-xl uppercase">{{ i.nombre }}</h3>
                  @if (i.descripcion) { <p class="text-sm text-mute">{{ i.descripcion }}</p> }
                </div>
                @if (i.precio !== null) { <b class="fd text-2xl">{{ fmt(i) }}</b> }
                <a class="btn btn-sm" [href]="pedir(i)" target="_blank" rel="noopener" [attr.aria-label]="boton() + ' ' + i.nombre">{{ boton() }}</a>
              </li>
            }
          </ol>
        } @else {
          <div class="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            @for (i of items(); track i.id) {
              <article class="lift rounded-2xl border border-line bg-surface p-6">
                <div class="grid h-12 w-12 place-items-center rounded-xl bg-soft text-brand">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/>
                  </svg>
                </div>
                <h3 class="mt-4 font-semibold">{{ i.nombre }}</h3>
                @if (i.descripcion) { <p class="mt-1 text-sm text-mute">{{ i.descripcion }}</p> }
                @if (i.precio !== null) { <p class="mt-2 font-semibold">{{ fmt(i) }}</p> }
                <a class="mt-3 inline-block text-sm font-semibold text-brand" [href]="pedir(i)" target="_blank" rel="noopener"
                   [attr.aria-label]="boton() + ' ' + i.nombre">{{ boton() }} →</a>
              </article>
            }
          </div>
        }
      </section>
    }`,
})
export class Servicios {
  private readonly store = inject(LandingStore);
  readonly datos = input.required<DatosSeccion>();
  protected readonly items = computed(() => this.store.itemsDe('servicio'));
  protected readonly numerada = computed(() => this.store.rubro() === 'barberia');
  protected readonly boton = computed(() => this.datos()['boton_item'] ?? 'Consultar');
  protected fmt = (i: Item) => precio(i.precio, this.datos()['moneda'] ?? 'S/');
  protected pedir = (i: Item) => this.store.wa(this.datos()['mensaje_item'] ?? 'Hola, quisiera consultar: {nombre}', i.nombre);
}
