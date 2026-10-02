import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Item } from '../../core/models';
import { CatalogoBase } from './catalogo-base';

const FAMILIAS = ['fresco', 'floral', 'amaderado'] as const;
const etiqueta = (f: string) => f.charAt(0).toUpperCase() + f.slice(1);

/** Perfumes · Laboratorio: fichas técnicas con barras de familia olfativa y filtros */
@Component({
  selector: 'app-catalogo-laboratorio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length) {
      <section class="lab-sec">
        <div class="lab-top">
          <h2 class="lab-h2">{{ datos()['titulo'] }}</h2>
          @if (familias().length > 1) {
            <div class="lab-chips" role="group" aria-label="Filtrar por familia">
              <button type="button" class="lab-chip" [attr.aria-pressed]="filtro() === 'todos'" (click)="filtro.set('todos')">Todos</button>
              @for (f of familias(); track f) {
                <button type="button" class="lab-chip" [attr.aria-pressed]="filtro() === f" (click)="filtro.set(f)">{{ etiqueta(f) }}</button>
              }
            </div>
          }
        </div>
        <div class="lab-grid">
          <!-- la clave incluye el filtro: al cambiarlo, las fichas que quedan vuelven a entrar escalonadas -->
          @for (i of visibles(); track i.id + '|' + filtro(); let n = $index) {
            <article class="lab-ficha" [style.--k]="n">
              <div class="lab-t"><span>N.º {{ n + 1 < 10 ? '0' + (n + 1) : n + 1 }}</span><span>{{ i.extra['ml'] }}</span></div>
              <div class="lab-ph">
                @if (imagen(i); as s) { <img [src]="s" [alt]="i.nombre" loading="lazy"> }
                @else {
                  <svg viewBox="0 0 120 200" aria-hidden="true"><rect x="42" y="6" width="36" height="28" rx="3" fill="var(--ink)"/><rect x="50" y="34" width="20" height="14" fill="var(--ink)"/>
                    <rect x="12" y="48" width="96" height="144" rx="14" fill="color-mix(in srgb, var(--bg) 70%, var(--ink))" stroke="var(--ink)" stroke-width="2"/>
                    <rect x="30" y="88" width="60" height="58" rx="2" fill="var(--bg)"/></svg>
                }
              </div>
              <h3>{{ i.nombre }}</h3>
              @if (i.extra['familia']) {
                <div class="lab-m">
                  @for (f of familiasDe; track f) { <div>{{ etiqueta(f) }}<i [style.--v]="valor(i, f)"></i></div> }
                </div>
              }
              <div class="lab-f">
                <span>{{ i.extra['notas'] ? resumen(i) : i.extra['marca'] }}</span>
                <b>{{ fmt(i) }}</b>
              </div>
              <a class="lab-link" [href]="pedir(i)" target="_blank" rel="noopener" [attr.aria-label]="boton() + ' ' + i.nombre">{{ boton() }} →</a>
            </article>
          }
        </div>
      </section>
    }`,
})
export class CatalogoLaboratorio extends CatalogoBase {
  protected readonly filtro = signal('todos');
  protected readonly familiasDe = FAMILIAS;
  protected readonly etiqueta = etiqueta;
  protected readonly familias = computed(() => [...new Set(this.items().flatMap((i) => [i.extra['familia'], i.extra['familia2']]).filter((f): f is string => !!f))]);
  protected readonly visibles = computed(() => this.items().filter((i) => this.filtro() === 'todos' || i.extra['familia'] === this.filtro() || i.extra['familia2'] === this.filtro()));

  /** Intensidad de cada familia: la principal marca 90 %, la segunda 60 % y el resto un 20 % */
  protected valor(i: Item, f: string): number {
    return i.extra['familia'] === f ? 0.9 : i.extra['familia2'] === f ? 0.6 : 0.2;
  }

  /** "Salida · Naranja; Corazón · Rosa" → "Naranja · Rosa · Pachulí" (solo los nombres de las notas) */
  protected resumen(i: Item): string {
    return String(i.extra['notas'] ?? '').split(';').map((n) => n.split('·').pop()?.trim()).filter(Boolean).join(' · ');
  }
}
