import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LandingStore } from '../core/landing.store';
import { DatosSeccion } from '../core/models';
import { urlSegura } from '../core/seguridad';
import { CountUp } from '../shared/reveal';
import { HeroAgenda } from './disenos/hero-agenda';
import { HeroCalido } from './disenos/hero-calido';
import { HeroCalle } from './disenos/hero-calle';
import { HeroLaboratorio } from './disenos/hero-laboratorio';
import { HeroMatutino } from './disenos/hero-matutino';
import { HeroNoir } from './disenos/hero-noir';
import { HeroPoste } from './disenos/hero-poste';
import { HeroTostadores } from './disenos/hero-tostadores';

/** Hero: una composición distinta por rubro y por diseño (el 'a' de cada rubro está aquí; los demás, en ./disenos). */
@Component({
  selector: 'app-hero',
  imports: [CountUp, HeroTostadores, HeroMatutino, HeroPoste, HeroCalle, HeroNoir, HeroLaboratorio, HeroCalido, HeroAgenda],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (variante()) {

      @case ('cafeteria-b') { <app-hero-tostadores [datos]="datos()" /> }
      @case ('cafeteria-c') { <app-hero-matutino [datos]="datos()" /> }
      @case ('barberia-b') { <app-hero-poste [datos]="datos()" /> }
      @case ('barberia-c') { <app-hero-calle [datos]="datos()" /> }
      @case ('perfumes-b') { <app-hero-noir [datos]="datos()" /> }
      @case ('perfumes-c') { <app-hero-laboratorio [datos]="datos()" /> }
      @case ('salud-b') { <app-hero-calido [datos]="datos()" /> }
      @case ('salud-c') { <app-hero-agenda [datos]="datos()" /> }

      @case ('cafeteria') {
        <div class="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-2 md:py-20">
          <div>
            @if (d().etiqueta) { <p class="text-sm uppercase tracking-widest text-mute">{{ d().etiqueta }}</p> }
            <h1 class="mt-3 text-5xl font-bold leading-[1.05] md:text-6xl">{{ d().titulo }}</h1>
            <p class="mt-4 max-w-md text-mute">{{ d().subtitulo }}</p>
            <div class="mt-7 flex flex-wrap gap-3">
              <a class="btn" [href]="wa()" target="_blank" rel="noopener">{{ d().boton?.texto }}</a>
              <a class="btn btn-ghost" href="#carta">Ver carta</a>
            </div>
          </div>
          <div class="relative mx-auto w-full max-w-md">
            <div class="ph floaty aspect-square rounded-full">@if (img(); as s) { <img [src]="s" alt="" fetchpriority="high"> }</div>
            <svg class="vapor absolute -top-6 left-1/2 -translate-x-1/2" width="90" height="70" viewBox="0 0 90 70" fill="none"
                 stroke="var(--accent)" stroke-width="4" stroke-linecap="round" aria-hidden="true">
              <path d="M20 65c-10-12 10-20 0-32s10-20 0-30"/><path d="M45 65c-10-12 10-20 0-32s10-20 0-30"/><path d="M70 65c-10-12 10-20 0-32s10-20 0-30"/>
            </svg>
            @if (d().rating) {
              <div class="absolute -bottom-3 -left-2 rounded-xl border border-line bg-bg px-4 py-3 text-sm shadow-lg"><b>{{ d().rating }}</b></div>
            }
          </div>
        </div>
      }

      @case ('barberia') {
        <div class="relative overflow-hidden pb-28 pt-16" style="clip-path: polygon(0 0,100% 0,100% 90%,0 100%); background: linear-gradient(120deg, color-mix(in srgb, var(--bg) 88%, white), var(--bg))">
          @if (img(); as s) { <img [src]="s" alt="" class="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-40 md:block" fetchpriority="high"> }
          @else { <div class="absolute inset-y-0 right-0 hidden w-1/2 opacity-[.1] md:block" style="background: repeating-linear-gradient(-45deg, var(--brand) 0 14px, transparent 14px 46px)" aria-hidden="true"></div> }
          <div class="relative mx-auto max-w-6xl px-6">
            @if (d().etiqueta) { <p class="text-sm uppercase tracking-[.3em] text-brand">{{ d().etiqueta }}</p> }
            <h1 class="mt-4 max-w-2xl text-6xl font-bold uppercase leading-[.95] md:text-8xl">{{ d().titulo }}</h1>
            <p class="mt-5 max-w-md text-mute">{{ d().subtitulo }}</p>
            <a class="btn shine mt-8" [href]="wa()" target="_blank" rel="noopener">{{ d().boton?.texto }}</a>
          </div>
        </div>
        <div class="marq relative -mt-14 mb-2 bg-brand py-3 fd text-xl uppercase tracking-[.3em] text-on-brand" style="transform: rotate(-1.2deg)" aria-hidden="true">
          <!-- dos copias idénticas: al desplazarse -50% el bucle es continuo -->
          <div [style.animation-duration.s]="cinta().length * 2.4">
            @for (t of cinta(); track $index) { <span>{{ t }}</span><span>✦</span> }
            @for (t of cinta(); track $index) { <span>{{ t }}</span><span>✦</span> }
          </div>
        </div>
      }

      @case ('perfumes') {
        <div class="mx-auto max-w-4xl px-6 py-20 text-center">
          @if (d().etiqueta) { <p class="text-xs uppercase tracking-[.4em]" style="color: var(--accent)">{{ d().etiqueta }}</p> }
          <h1 class="mt-5 text-6xl font-medium leading-none md:text-8xl">{{ d().titulo }}</h1>
          @if (img(); as s) {
            <div class="ph floaty mx-auto mt-10 aspect-[3/4] w-48"><img [src]="s" alt="" fetchpriority="high"></div>
          } @else {
            <svg class="floaty mx-auto mt-10" width="120" height="170" viewBox="0 0 120 170" fill="none" stroke="var(--accent)" stroke-width="1.5" aria-hidden="true">
              <rect x="44" y="6" width="32" height="22" rx="2"/><rect x="52" y="28" width="16" height="12"/>
              <path d="M22 62c0-14 12-22 38-22s38 8 38 22v82c0 12-12 20-38 20s-38-8-38-20z"/><path d="M36 90c14 8 34 8 48 0" opacity=".6"/><circle cx="60" cy="118" r="10" opacity=".6"/>
            </svg>
          }
          @if (d().subtitulo) { <p class="mx-auto mt-6 max-w-md text-mute">{{ d().subtitulo }}</p> }
          <div class="mt-8"><a class="btn shine" [href]="wa()" target="_blank" rel="noopener">{{ d().boton?.texto }}</a></div>
        </div>
      }

      @case ('salud') {
        <div class="mx-auto grid max-w-6xl gap-4 px-6 py-12 md:grid-cols-6">
          <div class="relative overflow-hidden rounded-[28px] bg-soft p-8 md:col-span-4 md:p-12">
            <div class="drift absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-20 bg-brand"></div>
            <div class="drift absolute bottom-4 right-24 h-24 w-24 rounded-full opacity-25 bg-accent" style="animation-delay: -4s"></div>
            <div class="relative">
              @if (d().etiqueta) { <p class="text-sm font-medium text-brand">{{ d().etiqueta }}</p> }
              <h1 class="mt-3 text-4xl font-semibold leading-tight md:text-5xl">{{ d().titulo }}</h1>
              <p class="mt-4 max-w-md text-mute">{{ d().subtitulo }}</p>
              <a class="btn mt-7" [href]="wa()" target="_blank" rel="noopener">{{ d().boton?.texto }}</a>
            </div>
          </div>
          <div class="grid gap-4 md:col-span-2">
            <div class="ph min-h-[150px] rounded-[28px]">@if (img(); as s) { <img [src]="s" alt="" fetchpriority="high"> }</div>
            @if (stat(); as st) {
              <div class="rounded-[28px] bg-brand p-6 text-on-brand">
                <b class="fd text-4xl">{{ st.prefijo }}<span [appCount]="+st.valor">{{ st.valor }}</span></b>
                <p class="mt-1 text-sm opacity-90">{{ st.texto }}</p>
              </div>
            }
          </div>
        </div>
      }
    }`,
})
export class Hero {
  protected readonly store = inject(LandingStore);
  readonly datos = input.required<DatosSeccion>();
  protected readonly d = computed(() => this.datos());
  /** El diseño 'a' usa el rubro como clave; los demás, rubro-diseño */
  protected readonly variante = computed(() => (this.store.diseno() === 'a' ? this.store.rubro() : this.store.estilo()));
  /** La cifra destacada solo se muestra si tiene valor y texto */
  protected readonly stat = computed(() => {
    const s = this.datos()['stat'];
    return s && s.valor !== '' && s.valor !== null && s.valor !== undefined && s.texto ? s : null;
  });
  protected readonly img = computed(() => urlSegura(this.datos()['imagen']));
  protected readonly wa = computed(() => this.store.wa(this.datos()['boton']?.mensaje ?? 'Hola, quisiera más información.'));
  /**
   * Palabras de la cinta de la barbería: las que escribió el dueño (separadas por comas) o, si no,
   * los nombres de sus servicios. Se repiten hasta tener al menos 14 para que la cinta siempre
   * llene el ancho de la pantalla (con pocas palabras quedaba vacía y daba saltos).
   */
  protected readonly cinta = computed<string[]>(() => {
    const propias = String(this.datos()['cinta'] ?? '').split(',').map((t) => t.trim()).filter(Boolean);
    const servicios = this.store.itemsDe('servicio').map((i) => i.nombre.trim()).filter(Boolean);
    const base = propias.length ? propias : servicios.length ? servicios : ['Corte', 'Barba', 'Afeitado'];
    return Array.from({ length: Math.max(14, base.length) }, (_, i) => base[i % base.length]);
  });
}
