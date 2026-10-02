import { ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Item } from '../../core/models';
import { resaltar } from '../../core/texto';
import { crearResorte, efectosDePuntero } from '../../shared/resorte';
import { CatalogoBase } from './catalogo-base';

const COLORES = ['var(--brand)', 'var(--accent)', 'color-mix(in srgb, var(--accent) 35%, var(--ink))', 'color-mix(in srgb, var(--brand) 40%, var(--bg))'];

/** Cafetería · Matutino: lista en letras grandes; el plato sobre el que pasas el cursor aparece y te sigue */
@Component({
  selector: 'app-catalogo-matutino',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length) {
      <section class="mat-menu">
        <div class="mx-auto max-w-6xl px-6">
          <h2 class="mat-h2">{{ t().antes }} @if (t().resalte) { <span>{{ t().resalte }}</span> }</h2>
          <div class="mat-lista st" (pointerleave)="sale()">
            @for (i of items(); track i.id; let n = $index) {
              <a class="mat-row" [href]="pedir(i)" target="_blank" rel="noopener" [attr.aria-label]="boton() + ' ' + i.nombre"
                 (pointerenter)="entra(i, n)" (pointermove)="mueve($event)">
                <h3>{{ i.nombre }}</h3>
                @if (i.descripcion) { <p>{{ i.descripcion }}</p> }
                <b>{{ fmt(i) }}</b>
              </a>
            }
          </div>
        </div>
        <div #prev class="mat-prev" [class.on]="visible()" [style.background]="fondo()" aria-hidden="true">
          @if (foto(); as s) { <img [src]="s" alt=""> } @else { {{ nombre() }} }
        </div>
      </section>
    }`,
})
export class CatalogoMatutino extends CatalogoBase {
  protected readonly t = computed(() => resaltar(this.datos()['titulo'], 2));
  protected readonly visible = signal(false);
  protected readonly nombre = signal('');
  protected readonly fondo = signal(COLORES[0]);
  protected readonly foto = signal<string | null>(null);
  private readonly prev = viewChild<ElementRef<HTMLElement>>('prev');
  private readonly resorte = crearResorte((x, y) => {
    const p = this.prev()?.nativeElement;
    if (p) p.style.transform = `translate3d(${x}px,${y}px,0)`;
  }, 0.16);

  constructor() {
    super();
    inject(DestroyRef).onDestroy(() => this.resorte.parar());
  }

  protected entra(i: Item, n: number): void {
    if (!efectosDePuntero()) return;
    this.nombre.set(i.nombre);
    this.fondo.set(COLORES[n % COLORES.length]);
    this.foto.set(this.imagen(i));
    this.visible.set(true);
  }

  protected mueve(e: PointerEvent): void {
    if (this.visible()) this.resorte.ir(e.clientX + 24, e.clientY - 90);
  }

  protected sale(): void {
    this.visible.set(false);
  }
}
