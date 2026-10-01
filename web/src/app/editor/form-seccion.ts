import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DefCampo, DefImagenes, DefItems, DefLista, ESQUEMAS } from '../core/esquemas';
import { EditorStore } from '../core/editor.store';
import { Seccion } from '../core/models';
import { getRuta } from '../core/ruta';
import { urlSegura } from '../core/seguridad';
import { CampoTexto } from '../shared/campo';
import { Icono } from '../shared/icono';
import { ImagenCampo } from '../shared/imagen-campo';
import { ImagenesService } from '../core/imagenes.service';
import { AvisoService } from '../core/aviso.service';
import { ItemsEditor } from './items-editor';

/** Formulario de una sección, generado a partir de su esquema (core/esquemas.ts) */
@Component({
  selector: 'app-form-seccion',
  imports: [CampoTexto, ImagenCampo, ItemsEditor, Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-4">
      @for (e of elementos(); track $index) {

        @if (e.t === 'lista') {
          <fieldset class="m-0 flex flex-col gap-3 border-0 p-0">
            <legend class="ui-label">{{ lista(e).l }}</legend>
            @for (fila of filas(lista(e)); track $index; let n = $index) {
              <div class="flex flex-col gap-3 rounded-xl border border-edge bg-card-2 p-3">
                @for (c of lista(e).campos; track c.k) {
                  <app-campo [label]="c.l" [tipo]="c.t === 'area' ? 'area' : 'text'" [max]="c.max ?? null" [ph]="c.ph ?? ''"
                             [valor]="texto(fila, c.k)" (valorChange)="dato(lista(e).k + '.' + n + '.' + c.k, $event)" />
                }
                <button type="button" class="ui-btn ui-btn-outline ui-btn-sm self-end" (click)="quitar(lista(e), n)">Quitar</button>
              </div>
            }
            <button type="button" class="ui-btn ui-btn-outline ui-btn-sm self-start" (click)="agregar(lista(e))">+ Añadir {{ lista(e).item.toLowerCase() }}</button>
          </fieldset>
        } @else if (e.t === 'imagenes') {
          <div>
            <span class="ui-label">{{ imgs(e).l }}</span>
            <div class="grid grid-cols-3 gap-2">
              @for (u of fotos(imgs(e)); track $index; let n = $index) {
                <div class="group relative aspect-square overflow-hidden rounded-lg border border-edge bg-card-2">
                  <img [src]="u" alt="" class="size-full object-cover">
                  <button type="button" class="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                          (click)="quitarFoto(imgs(e), n)" aria-label="Quitar foto"><app-icono n="x" [tamanio]="14" /></button>
                </div>
              }
              <label class="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-edge text-xs text-fg-subtle transition hover:bg-card-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary">
                @if (subiendo()) { <span class="ui-spinner"></span> } @else { <span class="text-xl leading-none">+</span>Añadir }
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple class="sr-only" (change)="subirFotos(imgs(e), $event)">
              </label>
            </div>
          </div>
        } @else if (e.t === 'items') {
          <div>
            <span class="ui-label">{{ items(e).l }}</span>
            <app-items-editor [tipo]="items(e).tipo" />
          </div>
        } @else if (e.t === 'imagen') {
          <app-imagen-campo [label]="campo(e).l" [valor]="url(campo(e).k)" (valorChange)="dato(campo(e).k, $event ?? '')" />
        } @else {
          <app-campo [label]="campo(e).l" [tipo]="campo(e).t === 'area' ? 'area' : campo(e).t === 'number' ? 'number' : 'text'"
                     [max]="campo(e).max ?? null" [ph]="campo(e).ph ?? ''" [ayuda]="campo(e).ayuda ?? ''"
                     [valor]="valor(campo(e).k)" (valorChange)="dato(campo(e).k, campo(e).t === 'number' ? ($event === null ? '' : $event) : $event)" />
        }
      }
    </div>`,
})
export class FormSeccion {
  private readonly store = inject(EditorStore);
  private readonly imagenes = inject(ImagenesService);
  private readonly avisos = inject(AvisoService);
  readonly seccion = input.required<Seccion>();
  protected readonly subiendo = signal(false);

  protected readonly elementos = computed(() =>
    ESQUEMAS[this.seccion().tipo].elementos.filter((e) => !e.solo || e.solo.includes(this.store.rubro())));

  /* Estrechadores de tipo para la plantilla */
  protected campo = (e: unknown) => e as DefCampo;
  protected lista = (e: unknown) => e as DefLista;
  protected imgs = (e: unknown) => e as DefImagenes;
  protected items = (e: unknown) => e as DefItems;

  protected valor(ruta: string): string | number | null {
    const v = getRuta(this.seccion().datos, ruta);
    return typeof v === 'number' || typeof v === 'string' ? v : '';
  }
  protected url = (ruta: string) => urlSegura(getRuta(this.seccion().datos, ruta));
  protected texto = (fila: Record<string, unknown>, k: string) => String(fila[k] ?? '');

  protected dato(ruta: string, v: unknown): void {
    // los números vacíos se guardan como "" para no dejar `null` en el JSON de la sección
    this.store.setDato(this.seccion().id, ruta, v);
  }

  protected filas(d: DefLista): Record<string, unknown>[] {
    const v = getRuta(this.seccion().datos, d.k);
    return Array.isArray(v) ? (v as Record<string, unknown>[]) : [];
  }
  protected agregar(d: DefLista): void {
    this.dato(d.k, [...this.filas(d), { ...d.vacio }]);
  }
  protected quitar(d: DefLista, n: number): void {
    this.dato(d.k, this.filas(d).filter((_, i) => i !== n));
  }

  protected fotos(d: DefImagenes): string[] {
    const v = getRuta(this.seccion().datos, d.k);
    return Array.isArray(v) ? (v as unknown[]).map(urlSegura).filter((u): u is string => !!u) : [];
  }
  protected quitarFoto(d: DefImagenes, n: number): void {
    this.dato(d.k, this.fotos(d).filter((_, i) => i !== n));
  }
  protected async subirFotos(d: DefImagenes, e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const archivos = [...(input.files ?? [])];
    input.value = '';
    if (!archivos.length) return;
    this.subiendo.set(true);
    const nuevas: string[] = [];
    for (const f of archivos) {
      try { nuevas.push(await this.imagenes.subir(f)); }
      catch (err) { this.avisos.error(err instanceof Error ? err.message : 'No se pudo subir una imagen.'); }
    }
    this.subiendo.set(false);
    if (nuevas.length) this.dato(d.k, [...this.fotos(d), ...nuevas]);
  }
}
