import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { EditorStore } from '../core/editor.store';
import { defDiseno, DISENOS } from '../core/disenos';
import { FUENTES, RADIOS } from '../core/esquemas';
import { Diseno, Tema } from '../core/models';
import { contraste, cargarFuentes } from '../core/tema';
import { Confirmar } from '../shared/confirmar';
import { Icono } from '../shared/icono';

const COLORES: { k: keyof Tema['colores']; nombre: string; ayuda: string }[] = [
  { k: 'primario', nombre: 'Color principal', ayuda: 'Botones y detalles de marca' },
  { k: 'acento', nombre: 'Color de acento', ayuda: 'Fondos de fotos y detalles suaves' },
  { k: 'fondo', nombre: 'Fondo', ayuda: 'Color de la página' },
  { k: 'texto', nombre: 'Texto', ayuda: 'Títulos y párrafos' },
];

@Component({
  selector: 'app-tab-diseno',
  imports: [Icono, Confirmar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mb-7">
      <h3 class="m-0 text-base font-semibold">Diseño de la página</h3>
      <p class="mb-3 mt-1 text-xs text-fg-subtle">Elige cómo se ve tu página. Tu contenido no cambia: solo su composición, colores y letras.</p>
      <div class="flex flex-col gap-2.5" role="radiogroup" aria-label="Diseño de la página">
        @for (d of disenos(); track d.id) {
          <button type="button" role="radio" [attr.aria-checked]="store.diseno() === d.id" (click)="elegir(d.id)"
                  class="flex items-center gap-3 rounded-xl border-2 p-2.5 text-left transition-[border-color,background-color,transform] duration-150 active:scale-[.985]"
                  [class]="store.diseno() === d.id ? 'border-primary bg-primary-soft' : 'border-edge bg-card hover:bg-card-2'">
            <span class="flex h-14 w-16 shrink-0 flex-col overflow-hidden rounded-lg ring-1 ring-black/10" aria-hidden="true">
              <span class="flex-1" [style.background]="d.tema.colores.fondo"></span>
              <span class="flex h-4"><span class="flex-1" [style.background]="d.tema.colores.primario"></span><span class="flex-1" [style.background]="d.tema.colores.acento"></span></span>
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-[17px] leading-tight" [style.font-family]="'\\'' + d.tema.fuentes.titulos + '\\', serif'">{{ d.nombre }}</span>
              <span class="block text-xs text-fg-subtle">{{ d.resumen }}</span>
            </span>
            @if (store.diseno() === d.id) { <span class="text-primary"><app-icono n="check" [tamanio]="18" /></span> }
          </button>
        }
      </div>
    </section>

    <section class="mb-7">
      <h3 class="m-0 text-base font-semibold">Paletas sugeridas</h3>
      <p class="mb-3 mt-1 text-xs text-fg-subtle">Un clic y se aplica. Luego puedes ajustar cada color.</p>
      <div class="grid grid-cols-2 gap-2.5">
        @for (p of paletas(); track p.nombre) {
          <button type="button" class="rounded-xl border-2 p-2.5 text-left transition hover:-translate-y-0.5" (click)="store.setColores(p.colores)"
                  [class]="igual(p.colores) ? 'border-primary bg-primary-soft' : 'border-edge bg-card'" [attr.aria-pressed]="igual(p.colores)">
            <span class="mb-2 flex h-9 overflow-hidden rounded-lg ring-1 ring-black/10">
              <span class="flex-1" [style.background]="p.colores.fondo"></span>
              <span class="flex-1" [style.background]="p.colores.primario"></span>
              <span class="flex-1" [style.background]="p.colores.acento"></span>
              <span class="flex-1" [style.background]="p.colores.texto"></span>
            </span>
            <span class="text-[13px] font-semibold">{{ p.nombre }}</span>
          </button>
        }
      </div>
    </section>

    <section class="mb-7">
      <h3 class="m-0 mb-3 text-base font-semibold">Colores</h3>
      <div class="flex flex-col gap-3">
        @for (c of colores; track c.k) {
          <div class="flex items-center gap-3">
            <label class="relative size-11 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-edge shadow-sm">
              <span class="absolute inset-0" [style.background]="tema().colores[c.k]"></span>
              <input type="color" class="absolute inset-0 size-full cursor-pointer opacity-0" [value]="tema().colores[c.k]"
                     (input)="store.setColor(c.k, $any($event.target).value)" [attr.aria-label]="c.nombre">
            </label>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-semibold">{{ c.nombre }}</div>
              <div class="text-xs text-fg-subtle">{{ c.ayuda }}</div>
            </div>
            <input class="ui-input !h-9 !w-[104px] font-mono text-xs uppercase" [value]="tema().colores[c.k]" maxlength="7" spellcheck="false"
                   (change)="store.setColor(c.k, normalizar($any($event.target).value)); $any($event.target).value = tema().colores[c.k]" [attr.aria-label]="c.nombre + ' (código)'">
          </div>
        }
      </div>
      @for (a of avisos(); track a) {
        <p class="mb-0 mt-3 flex items-start gap-2 rounded-[10px] bg-warn-bg px-3 py-2 text-xs text-warn-fg" role="status"><app-icono n="alert" [tamanio]="16" />{{ a }}</p>
      }
    </section>

    <section class="mb-7">
      <h3 class="m-0 mb-3 text-base font-semibold">Tipografía</h3>
      <div class="flex flex-col gap-2">
        @for (f of fuentes; track f.id) {
          <button type="button" class="flex items-center justify-between rounded-xl border-2 px-3.5 py-2.5 text-left transition"
                  [class]="activa(f.titulos) ? 'border-primary bg-primary-soft' : 'border-edge bg-card hover:bg-card-2'" (click)="store.setFuentes(f.titulos, f.texto)" [attr.aria-pressed]="activa(f.titulos)">
            <span>
              <span class="block text-xl leading-tight" [style.font-family]="'\\'' + f.titulos + '\\', serif'">{{ f.titulos }}</span>
              <span class="block text-xs text-fg-subtle">{{ f.estilo }}</span>
            </span>
            @if (activa(f.titulos)) { <span class="text-primary"><app-icono n="check" [tamanio]="18" /></span> }
          </button>
        }
      </div>
    </section>

    <section class="mb-7">
      <h3 class="m-0 mb-3 text-base font-semibold">Forma de los bordes</h3>
      <div class="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Forma de los bordes">
        @for (r of radios; track r.id) {
          <button type="button" class="flex flex-col items-center gap-2 rounded-xl border-2 px-2 py-3 transition" role="radio" [attr.aria-checked]="tema().radio === r.valor"
                  [class]="tema().radio === r.valor ? 'border-primary bg-primary-soft' : 'border-edge bg-card hover:bg-card-2'" (click)="store.setRadio(r.valor)">
            <span class="h-9 w-14 border-2 border-fg-muted" [style.border-radius]="r.valor"></span>
            <span class="text-xs font-semibold">{{ r.nombre }}</span>
          </button>
        }
      </div>
    </section>

    <button type="button" class="ui-btn ui-btn-outline ui-btn-sm" (click)="store.restablecerTema()">Volver a los colores originales</button>

    <app-confirmar [abierto]="!!pendiente()" titulo="¿Cambiar de diseño?" boton="Cambiar diseño"
                   mensaje="Has personalizado los colores, la tipografía o los bordes. Al cambiar de diseño se aplican los del nuevo diseño; tu contenido no se pierde."
                   (aceptar)="confirmar()" (cancelar)="pendiente.set(null)" />`,
})
export class TabDiseno {
  protected readonly store = inject(EditorStore);
  protected readonly tema = this.store.tema;
  protected readonly colores = COLORES;
  protected readonly fuentes = FUENTES;
  protected readonly radios = RADIOS;
  protected readonly disenos = computed(() => DISENOS[this.store.rubro()]);
  protected readonly paletas = computed(() => defDiseno(this.store.rubro(), this.store.diseno()).paletas);
  protected readonly pendiente = signal<Diseno | null>(null);

  /** ¿El cliente cambió algo del diseño (colores, letras o bordes)? */
  private personalizado(): boolean {
    const t = this.tema();
    const base = defDiseno(this.store.rubro(), this.store.diseno()).tema;
    return JSON.stringify([t.colores, t.fuentes, t.radio]) !== JSON.stringify([base.colores, base.fuentes, base.radio]);
  }

  protected elegir(d: Diseno): void {
    if (d === this.store.diseno()) return;
    if (this.personalizado()) this.pendiente.set(d);
    else this.store.setDiseno(d);
  }

  protected confirmar(): void {
    const d = this.pendiente();
    this.pendiente.set(null);
    if (d) this.store.setDiseno(d);
  }

  /** Avisos de legibilidad */
  protected readonly avisos = computed(() => {
    const c = this.tema().colores;
    const a: string[] = [];
    if (contraste(c.texto, c.fondo) < 4.5) a.push('El texto casi no se distingue del fondo: se leerá con dificultad. Aleja más sus tonos (uno claro, otro oscuro).');
    if (contraste(c.primario, c.fondo) < 3) a.push('El color principal se parece mucho al fondo: los botones y detalles pasarán desapercibidos.');
    return a;
  });

  constructor() {
    // las fuentes se cargan para mostrar cada nombre con su propia tipografía
    const doc = inject(DOCUMENT);
    for (const f of FUENTES) cargarFuentes({ colores: this.tema().colores, fuentes: { titulos: f.titulos, texto: f.texto }, radio: '12px' }, doc);
    for (const d of this.disenos()) cargarFuentes(d.tema, doc, this.store.rubro());
  }

  protected igual = (c: Tema['colores']) => (Object.keys(c) as (keyof Tema['colores'])[]).every((k) => c[k].toLowerCase() === this.tema().colores[k].toLowerCase());
  protected activa = (titulos: string) => this.tema().fuentes.titulos === titulos;
  protected normalizar(v: string): string {
    const s = v.trim();
    return /^#?[0-9a-f]{6}$/i.test(s) ? (s.startsWith('#') ? s : '#' + s) : '';
  }
}
