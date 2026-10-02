import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Item } from '../../core/models';
import { CatalogoBase } from './catalogo-base';

/** Perfumes · Noir: carrusel de frascos; al pasar el cursor (o enfocar) se revelan sus notas */
@Component({
  selector: 'app-catalogo-noir',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length) {
      <section class="noi-sec">
        <div class="mx-auto max-w-6xl px-6">
          <h2 class="noi-h2">{{ datos()['titulo'] }}</h2>
          <p class="noi-sub">Desliza para ver la colección. Pasa el cursor sobre un frasco para conocer sus notas.</p>
        </div>
        <div class="noi-riel st" tabindex="-1">
          @for (i of items(); track i.id) {
            <article class="noi-card" tabindex="0">
              <div class="noi-ph">
                @if (imagen(i); as s) { <img [src]="s" [alt]="i.nombre" loading="lazy"> }
                @else {
                  <svg viewBox="0 0 120 200" aria-hidden="true"><rect x="42" y="6" width="36" height="28" rx="3" fill="var(--brand)"/><rect x="50" y="34" width="20" height="14" fill="var(--brand)"/>
                    <rect x="12" y="48" width="96" height="144" rx="14" fill="color-mix(in srgb, var(--accent) 45%, var(--bg))" stroke="var(--brand)" stroke-opacity=".7" stroke-width="2"/>
                    <rect x="30" y="88" width="60" height="58" rx="2" fill="color-mix(in srgb, var(--brand) 14%, transparent)"/><path d="M24 62v112" stroke="#fff" stroke-opacity=".3" stroke-width="5" stroke-linecap="round"/></svg>
                }
              </div>
              <small>{{ i.extra['marca'] || i.extra['familia'] || '' }}@if (i.extra['ml']) { · {{ i.extra['ml'] }} }</small>
              <h3>{{ i.nombre }}</h3>
              <p class="noi-pr">{{ fmt(i) }}</p>
              <div class="noi-notas">
                <b>Notas</b>
                @for (n of notas(i); track $index) { <span>{{ n }}</span> }
                @if (!notas(i).length && i.descripcion) { <span>{{ i.descripcion }}</span> }
                <a [href]="pedir(i)" target="_blank" rel="noopener" [attr.aria-label]="boton() + ' ' + i.nombre">{{ boton() }} →</a>
              </div>
            </article>
          }
        </div>
      </section>
    }`,
})
export class CatalogoNoir extends CatalogoBase {
  /** "Salida · Pimienta; Corazón · Oud; Fondo · Vainilla" → una línea por nota */
  protected notas = (i: Item): string[] => String(i.extra['notas'] ?? '').split(';').map((n) => n.trim()).filter(Boolean);
}
