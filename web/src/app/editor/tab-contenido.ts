import { ChangeDetectionStrategy, Component, inject, model, output, signal } from '@angular/core';
import { EditorStore } from '../core/editor.store';
import { ESQUEMAS, nombreSeccion } from '../core/esquemas';
import { Seccion } from '../core/models';
import { Icono } from '../shared/icono';
import { FormSeccion } from './form-seccion';

/** Lista de secciones de la landing: abrir, editar, ocultar, ordenar, añadir y quitar */
@Component({
  selector: 'app-tab-contenido',
  imports: [FormSeccion, Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="m-0 mb-4 text-sm text-fg-muted">Toca una sección para editarla. Con las flechas cambias el orden y con el ojo la ocultas.</p>

    <ol class="m-0 flex list-none flex-col gap-2.5 p-0">
      @for (s of store.secciones(); track s.id; let n = $index; let ultimo = $last) {
        <li class="overflow-hidden rounded-xl border bg-card transition-colors" [class]="abierta() === s.id ? 'border-primary' : 'border-edge'" [attr.id]="'sec-' + s.id">
          <div class="flex items-center gap-1 pr-2" [class.opacity-60]="!s.visible">
            <button type="button" class="flex min-w-0 flex-1 items-center gap-3 px-3.5 py-3 text-left" (click)="alternar(s)" [attr.aria-expanded]="abierta() === s.id">
              <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"><app-icono [n]="def(s).icono" [tamanio]="16" /></span>
              <span class="min-w-0">
                <span class="block truncate text-sm font-semibold">{{ nombre(s) }}</span>
                @if (!s.visible) { <span class="block text-xs text-fg-subtle">Oculta en tu página</span> }
              </span>
            </button>
            @if (s.tipo !== 'hero') {
              <button type="button" class="ui-icon-btn !size-8" [disabled]="n <= 1" (click)="store.mover(s.id, -1)" aria-label="Subir sección"><app-icono n="left" [tamanio]="16" style="transform: rotate(90deg)" /></button>
              <button type="button" class="ui-icon-btn !size-8" [disabled]="ultimo" (click)="store.mover(s.id, 1)" aria-label="Bajar sección"><app-icono n="right" [tamanio]="16" style="transform: rotate(90deg)" /></button>
              <button type="button" class="ui-icon-btn !size-8" (click)="store.alternarVisible(s.id)" [attr.aria-label]="s.visible ? 'Ocultar sección' : 'Mostrar sección'" [attr.aria-pressed]="s.visible">
                <app-icono [n]="s.visible ? 'eye' : 'eye-off'" [tamanio]="16" />
              </button>
            }
          </div>

          @if (abierta() === s.id) {
            <div class="border-t border-edge p-4">
              <p class="m-0 mb-4 text-xs text-fg-subtle">{{ def(s).descripcion }}</p>
              <app-form-seccion [seccion]="s" />
              @if (s.tipo !== 'hero') {
                <div class="mt-5 flex items-center justify-end gap-2 border-t border-edge pt-4">
                  @if (confirmar() === s.id) {
                    <span class="mr-auto text-xs text-fg-muted">¿Quitar esta sección?</span>
                    <button type="button" class="ui-btn ui-btn-outline ui-btn-sm" (click)="confirmar.set('')">No</button>
                    <button type="button" class="ui-btn ui-btn-danger ui-btn-sm" (click)="quitar(s)">Sí, quitar</button>
                  } @else {
                    <button type="button" class="ui-btn ui-btn-outline ui-btn-sm" (click)="confirmar.set(s.id)">Quitar sección</button>
                  }
                </div>
              }
            </div>
          }
        </li>
      }
    </ol>

    @if (store.tiposDisponibles().length) {
      <div class="mt-6">
        <h3 class="m-0 mb-2.5 text-[13px] font-semibold uppercase tracking-wide text-fg-subtle">Añadir sección</h3>
        <div class="grid gap-2">
          @for (t of store.tiposDisponibles(); track t) {
            <button type="button" class="flex items-center gap-3 rounded-xl border border-dashed border-edge px-3.5 py-2.5 text-left transition hover:border-primary hover:bg-primary-soft" (click)="agregar(t)">
              <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card-2 text-fg-muted"><app-icono [n]="esquemas[t].icono" [tamanio]="16" /></span>
              <span class="min-w-0">
                <span class="block text-sm font-semibold">{{ nombreTipo(t) }}</span>
                <span class="block truncate text-xs text-fg-subtle">{{ esquemas[t].descripcion }}</span>
              </span>
            </button>
          }
        </div>
      </div>
    }`,
})
export class TabContenido {
  protected readonly store = inject(EditorStore);
  protected readonly esquemas = ESQUEMAS;
  /** Sección abierta (la fija también la vista previa al hacer clic en una sección) */
  readonly abierta = model<string | null>('hero');
  /** Pide a la vista previa que se desplace a esa sección */
  readonly ir = output<string>();
  protected readonly confirmar = signal('');

  protected def = (s: Seccion) => ESQUEMAS[s.tipo];
  protected nombre = (s: Seccion) => nombreSeccion(s.tipo, this.store.rubro());
  protected nombreTipo = (t: Seccion['tipo']) => nombreSeccion(t, this.store.rubro());

  protected alternar(s: Seccion): void {
    const abrir = this.abierta() !== s.id;
    this.abierta.set(abrir ? s.id : null);
    if (abrir) this.ir.emit(s.id);
  }

  protected agregar(t: Seccion['tipo']): void {
    const id = this.store.agregarSeccion(t);
    this.abierta.set(id);
    this.ir.emit(id);
  }

  protected quitar(s: Seccion): void {
    this.confirmar.set('');
    this.store.eliminarSeccion(s.id);
    this.abierta.set(null);
  }
}
