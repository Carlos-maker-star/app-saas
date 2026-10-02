import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CatalogoBase } from './catalogo-base';

/** Cafetería · Tostadores: la carta como un ticket de caja, con puntos guía y el relleno que barre al pasar el cursor */
@Component({
  selector: 'app-catalogo-ticket',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length) {
      <section class="mx-auto max-w-6xl px-6 py-12">
        <div class="tos-ticket">
          <h2 class="tos-h2"><span>{{ datos()['titulo'] }}</span>@if (datos()['subtitulo']) { <small>{{ datos()['subtitulo'] }}</small> }</h2>
          <div class="tos-cols st">
            @for (g of grupos(); track g.categoria) {
              <div>
                @if (g.categoria) { <p class="tos-tt">{{ g.categoria }}</p> }
                @for (i of g.items; track i.id) {
                  <a class="tos-row" [href]="pedir(i)" target="_blank" rel="noopener" [attr.aria-label]="boton() + ' ' + i.nombre">
                    <b>{{ i.nombre }}@if (i.descripcion) { <small>{{ i.descripcion }}</small> }</b><span class="tos-d"></span><b>{{ fmt(i) }}</b>
                  </a>
                }
              </div>
            }
          </div>
        </div>
      </section>
    }`,
})
export class CatalogoTicket extends CatalogoBase {}
