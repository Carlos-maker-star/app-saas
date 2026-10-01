import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { AvisoService } from '../core/aviso.service';
import { EditorStore } from '../core/editor.store';
import { Item } from '../core/models';
import { urlSegura } from '../core/seguridad';
import { CampoTexto } from '../shared/campo';
import { Icono } from '../shared/icono';
import { ImagenCampo } from '../shared/imagen-campo';

const TEXTOS = {
  producto: { uno: 'producto', nuevo: 'Añadir producto', vacio: 'Aún no tienes productos.', desc: 'Descripción' },
  servicio: { uno: 'servicio', nuevo: 'Añadir servicio', vacio: 'Aún no tienes servicios.', desc: 'Descripción' },
  miembro: { uno: 'integrante', nuevo: 'Añadir integrante', vacio: 'Aún no tienes integrantes.', desc: 'Cargo o especialidad' },
} as const;

/** Lista editable de productos, servicios o integrantes del equipo */
@Component({
  selector: 'app-items-editor',
  imports: [CampoTexto, ImagenCampo, Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-2">
      @for (i of lista(); track i.id; let primero = $first; let ultimo = $last) {
        <details class="group overflow-hidden rounded-xl border border-edge bg-card" [class.opacity-60]="!i.visible">
          <summary class="flex items-center gap-2.5 px-3 py-2.5 hover:bg-card-2">
            <span class="relative size-9 shrink-0 overflow-hidden rounded-lg bg-card-2">
              @if (img(i); as u) { <img [src]="u" alt="" class="absolute inset-0 size-full object-cover"> }
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-semibold">{{ i.nombre || 'Sin nombre' }}</span>
              @if (i.precio !== null || i.categoria) {
                <span class="block truncate text-xs text-fg-subtle">{{ i.categoria }}{{ i.categoria && i.precio !== null ? ' · ' : '' }}{{ i.precio !== null ? i.precio : '' }}</span>
              }
            </span>
            <span class="flex shrink-0 items-center" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()">
              <button type="button" class="ui-icon-btn !size-8" [disabled]="primero" (click)="$event.preventDefault(); store.moverItem(i.id, -1)" aria-label="Subir"><app-icono n="left" [tamanio]="16" style="transform: rotate(90deg)" /></button>
              <button type="button" class="ui-icon-btn !size-8" [disabled]="ultimo" (click)="$event.preventDefault(); store.moverItem(i.id, 1)" aria-label="Bajar"><app-icono n="right" [tamanio]="16" style="transform: rotate(90deg)" /></button>
              <button type="button" class="ui-icon-btn !size-8" (click)="$event.preventDefault(); store.editarItem(i.id, { visible: !i.visible })"
                      [attr.aria-label]="i.visible ? 'Ocultar de la página' : 'Mostrar en la página'" [attr.aria-pressed]="i.visible">
                <app-icono [n]="i.visible ? 'eye' : 'eye-off'" [tamanio]="16" />
              </button>
            </span>
          </summary>

          <div class="flex flex-col gap-4 border-t border-edge p-3.5">
            <app-campo label="Nombre" [valor]="i.nombre" (valorChange)="store.editarItem(i.id, { nombre: '' + $event })" [max]="80" />
            <app-campo [label]="t().desc" tipo="area" [valor]="i.descripcion ?? ''" (valorChange)="store.editarItem(i.id, { descripcion: '' + $event })" [max]="160" />

            @if (tipo() !== 'miembro') {
              <app-campo label="Precio (opcional)" tipo="number" [valor]="i.precio" (valorChange)="precio(i, $event)" ph="0" />
            }
            @if (tipo() === 'producto' && store.rubro() === 'cafeteria') {
              <app-campo label="Categoría" [valor]="i.categoria ?? ''" (valorChange)="store.editarItem(i.id, { categoria: '' + $event })" ph="Cafés, Postres…" [max]="30"
                         ayuda="Los productos con la misma categoría se agrupan en la carta." />
            }
            @if (tipo() === 'producto' && store.rubro() === 'perfumes') {
              <app-campo label="Marca" [valor]="i.extra['marca'] ?? ''" (valorChange)="extra(i, 'marca', '' + $event)" [max]="40" />
              <div>
                <label class="ui-label" [attr.for]="'g-' + i.id">Para</label>
                <select class="ui-input" [id]="'g-' + i.id" [value]="i.extra['genero'] ?? 'unisex'" (change)="extra(i, 'genero', $any($event.target).value)">
                  <option value="ella">Ella</option><option value="el">Él</option><option value="unisex">Unisex</option>
                </select>
              </div>
            }
            @if (tipo() !== 'servicio') {
              <app-imagen-campo label="Foto" [valor]="i.imagen_url" (valorChange)="store.editarItem(i.id, { imagen_url: $event })" [ladoMax]="1000" />
            }

            <div class="flex justify-end border-t border-edge pt-3">
              @if (confirmar() === i.id) {
                <span class="mr-auto self-center text-xs text-fg-muted">¿Eliminar este {{ t().uno }}?</span>
                <button type="button" class="ui-btn ui-btn-outline ui-btn-sm mr-2" (click)="confirmar.set('')">No</button>
                <button type="button" class="ui-btn ui-btn-danger ui-btn-sm" (click)="eliminar(i)">Sí, eliminar</button>
              } @else {
                <button type="button" class="ui-btn ui-btn-outline ui-btn-sm" (click)="confirmar.set(i.id)">Eliminar</button>
              }
            </div>
          </div>
        </details>
      } @empty {
        <p class="m-0 rounded-xl border border-dashed border-edge px-4 py-6 text-center text-sm text-fg-subtle">{{ t().vacio }}</p>
      }

      <button type="button" class="ui-btn ui-btn-outline ui-btn-sm self-start" [disabled]="agregando()" (click)="agregar()">
        @if (agregando()) { <span class="ui-spinner"></span> } @else { + }{{ t().nuevo }}
      </button>
      <p class="m-0 text-xs text-fg-subtle">Se guardan al instante y se ven en tu página publicada.</p>
    </div>`,
})
export class ItemsEditor {
  protected readonly store = inject(EditorStore);
  private readonly avisos = inject(AvisoService);
  readonly tipo = input.required<Item['tipo']>();
  protected readonly t = computed(() => TEXTOS[this.tipo()]);
  protected readonly lista = computed(() => this.store.items().filter((i) => i.tipo === this.tipo()).sort((a, b) => a.orden - b.orden));
  protected readonly agregando = signal(false);
  protected readonly confirmar = signal('');

  protected img = (i: Item) => urlSegura(i.imagen_url);

  protected precio(i: Item, v: string | number | null): void {
    this.store.editarItem(i.id, { precio: typeof v === 'number' && v >= 0 ? v : null });
  }

  protected extra(i: Item, clave: string, valor: string): void {
    this.store.editarItem(i.id, { extra: { ...i.extra, [clave]: valor } });
  }

  protected async agregar(): Promise<void> {
    this.agregando.set(true);
    const ok = await this.store.agregarItem(this.tipo());
    this.agregando.set(false);
    if (!ok) this.avisos.error('No se pudo añadir. Intenta de nuevo.');
  }

  protected async eliminar(i: Item): Promise<void> {
    this.confirmar.set('');
    if (!(await this.store.eliminarItem(i.id))) this.avisos.error('No se pudo eliminar.');
  }
}
