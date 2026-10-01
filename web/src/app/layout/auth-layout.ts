import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MARCA } from '../core/marca';
import { TemaApp } from '../core/tema-app';
import { Icono } from '../shared/icono';
import { Logo } from './logo';

/** Mini vistas de las 4 plantillas (con sus paletas reales) para el panel de marca */
const MUESTRAS = [
  { n: 'Café Aroma', fondo: '#FBF6EF', tinta: '#2B1D14', marca: '#6F4E37', icono: 'coffee', rot: -3, x: 0, y: 8 },
  { n: 'DON FILO', fondo: '#0D0D0D', tinta: '#F2F2F2', marca: '#C9A227', icono: 'scissors', rot: 2.5, x: 40, y: 0 },
  { n: 'Essence', fondo: '#FAF8F5', tinta: '#1F1B24', marca: '#1F1B24', icono: 'perfume', rot: 2, x: 0, y: -4 },
  { n: 'Clínica Vida', fondo: '#F6FBFB', tinta: '#12333A', marca: '#0E7C86', icono: 'heart', rot: -2.5, x: 40, y: -10 },
];

/** Marco de login/registro: panel de marca (≥ lg) y formulario a la derecha */
@Component({
  selector: 'app-auth-layout',
  imports: [Icono, Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-ui block' },
  template: `
    <div class="flex min-h-dvh">
      <section class="relative hidden w-[560px] shrink-0 flex-col justify-between overflow-hidden bg-panel-brand px-14 py-12 text-white lg:flex xl:w-[640px]">
        <!-- fondo: cuadrícula tenue y resplandor -->
        <div class="pointer-events-none absolute inset-0 opacity-[.07]"
             style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 44px 44px"></div>
        <div class="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full opacity-40 blur-3xl" style="background: #6366f1"></div>

        <div class="relative"><app-logo [claro]="true" /></div>

        <div class="relative flex flex-col gap-9">
          <h2 class="m-0 max-w-[460px] text-[40px] font-semibold leading-[1.1] tracking-tight">{{ marca.frase }}</h2>

          <div class="grid max-w-[420px] grid-cols-2 gap-x-4 gap-y-3" aria-hidden="true">
            @for (m of muestras; track m.n; let i = $index) {
              <div class="floaty rounded-xl p-3 shadow-xl ring-1 ring-black/10"
                   [style.background]="m.fondo" [style.color]="m.tinta"
                   [style.transform]="'rotate(' + m.rot + 'deg) translateY(' + m.y + 'px)'"
                   [style.animation-delay]="(i * -1.2) + 's'">
                <div class="flex items-center justify-between text-[11px] font-semibold">
                  <span>{{ m.n }}</span><span class="size-1.5 rounded-full" [style.background]="m.marca"></span>
                </div>
                <div class="mt-3 h-2 w-4/5 rounded-full opacity-80" [style.background]="m.tinta"></div>
                <div class="mt-1.5 h-2 w-3/5 rounded-full opacity-30" [style.background]="m.tinta"></div>
                <div class="mt-3 flex items-center justify-between">
                  <span class="rounded-md px-2.5 py-1 text-[10px] font-semibold"
                        [style.background]="m.marca" [style.color]="m.fondo">WhatsApp</span>
                  <span [style.color]="m.marca"><app-icono [n]="m.icono" [tamanio]="16" /></span>
                </div>
              </div>
            }
          </div>

          <ol class="m-0 flex list-none flex-col gap-4 p-0">
            @for (paso of marca.pasos; track $index) {
              <li class="flex items-start gap-3.5">
                <span class="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/35 font-mono text-xs">{{ $index + 1 }}</span>
                <span class="text-[15px] leading-snug text-white/85">{{ paso }}</span>
              </li>
            }
          </ol>
        </div>

        <span class="relative text-[13px] text-white/70">{{ marca.ayuda }}</span>
      </section>

      <section class="relative flex flex-1 items-center justify-center bg-app px-4 py-12">
        <button type="button" class="ui-icon-btn absolute right-5 top-5" (click)="tema.alternar()"
                [attr.aria-label]="tema.oscuro() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
          <app-icono [n]="tema.oscuro() ? 'sun' : 'moon'" />
        </button>
        <div class="rise w-full max-w-[400px]">
          <div class="mb-8 lg:hidden"><app-logo /></div>
          <ng-content />
        </div>
      </section>
    </div>`,
})
export class AuthLayout {
  protected readonly tema = inject(TemaApp);
  protected readonly marca = MARCA;
  protected readonly muestras = MUESTRAS;
}
