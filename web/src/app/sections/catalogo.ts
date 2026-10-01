import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { LandingStore } from '../core/landing.store';
import { DatosSeccion, Item } from '../core/models';
import { precio } from '../core/format';
import { urlSegura } from '../core/seguridad';

const ETIQUETA_FILTRO: Record<string, string> = { ella: 'Ella', el: 'Él', unisex: 'Unisex' };

/** Carta / catálogo de productos. Cafetería: lista con puntos guía. Resto: cuadrícula con filtros. */
@Component({
  selector: 'app-catalogo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length) {
      <section class="mx-auto max-w-6xl px-6 py-14">
        <h2 class="h2" [class.text-center]="cafe()">{{ datos()['titulo'] }}</h2>
        @if (datos()['subtitulo']) { <p class="mt-2 text-mute" [class.text-center]="cafe()">{{ datos()['subtitulo'] }}</p> }

        @if (cafe()) {
          <div class="mx-auto mt-10 grid max-w-5xl gap-x-14 gap-y-10 md:grid-cols-2">
            @for (g of grupos(); track g.categoria) {
              <div>
                @if (g.categoria) { <h3 class="mb-4 text-2xl text-brand">{{ g.categoria }}</h3> }
                <ul class="space-y-4">
                  @for (i of g.items; track i.id) {
                    <li>
                      <a [href]="pedir(i)" target="_blank" rel="noopener" class="lift -m-2 block rounded-lg p-2" [attr.aria-label]="boton() + ' ' + i.nombre">
                        <div class="leader"><b>{{ i.nombre }}</b><i></i><b>{{ fmt(i) }}</b></div>
                        @if (i.descripcion) { <p class="text-sm text-mute">{{ i.descripcion }}</p> }
                      </a>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        } @else {
          @if (filtros().length) {
            <div class="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar">
              <button class="chip" [attr.aria-pressed]="filtro() === 'todos'" (click)="filtro.set('todos')">Todos</button>
              @for (f of filtros(); track f) {
                <button class="chip" [attr.aria-pressed]="filtro() === f" (click)="filtro.set(f)">{{ etiqueta(f) }}</button>
              }
            </div>
          }
          <div class="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            @for (i of visibles(); track i.id) {
              <article>
                <div class="ph aspect-[4/5]">@if (imagen(i); as s) { <img [src]="s" [alt]="i.nombre" loading="lazy"> }</div>
                @if (i.extra['marca']) { <p class="mt-4 text-xs uppercase tracking-[.2em] text-mute">{{ i.extra['marca'] }}</p> }
                <h3 class="text-2xl" [class.mt-4]="!i.extra['marca']">{{ i.nombre }}</h3>
                <div class="mt-1 flex items-center justify-between gap-2">
                  <b>{{ fmt(i) }}</b>
                  <a [href]="pedir(i)" target="_blank" rel="noopener" class="u-link text-sm" [attr.aria-label]="boton() + ' ' + i.nombre">{{ boton() }}</a>
                </div>
              </article>
            }
          </div>
        }
      </section>
    }`,
})
export class Catalogo {
  private readonly store = inject(LandingStore);
  readonly datos = input.required<DatosSeccion>();
  protected readonly filtro = signal('todos');

  protected readonly cafe = computed(() => this.store.rubro() === 'cafeteria');
  protected readonly items = computed(() => this.store.itemsDe(this.datos()['tipo_item'] ?? 'producto'));
  protected readonly filtros = computed<string[]>(() => this.datos()['filtros'] ?? []);
  protected readonly visibles = computed(() =>
    this.items().filter((i) => this.filtro() === 'todos' || i.extra['genero'] === this.filtro()));
  protected readonly grupos = computed(() => {
    const m = new Map<string, Item[]>();
    for (const i of this.items()) m.set(i.categoria ?? '', [...(m.get(i.categoria ?? '') ?? []), i]);
    return [...m].map(([categoria, items]) => ({ categoria, items }));
  });
  protected readonly boton = computed(() => this.datos()['boton_item'] ?? 'Consultar');

  protected etiqueta = (f: string) => ETIQUETA_FILTRO[f] ?? f;
  protected fmt = (i: Item) => precio(i.precio, this.datos()['moneda'] ?? 'S/');
  protected imagen = (i: Item) => urlSegura(i.imagen_url);
  protected pedir = (i: Item) => this.store.wa(this.datos()['mensaje_item'] ?? 'Hola, me interesa: {nombre}', i.nombre);
}
