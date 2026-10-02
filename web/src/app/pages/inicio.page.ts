import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DISENOS } from '../core/disenos';
import { Entorno } from '../core/entorno';
import { SeoService } from '../core/seo.service';
import { LandingPage } from './landing.page';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, LandingPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (slug) {
      <app-landing [slug]="slug" />
    } @else {
      <main class="mx-auto max-w-3xl px-6 py-16">
        <nav class="mb-10 flex flex-wrap items-center justify-between gap-3" aria-label="Cuenta">
          <span class="text-lg font-bold">Vitrina</span>
          <span class="flex gap-2">
            <a routerLink="/login" class="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-neutral-50">Iniciar sesión</a>
            <a routerLink="/registro" class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700">Crear mi página</a>
          </span>
        </nav>
        <h1 class="text-3xl font-bold">Plantillas de demostración</h1>
        <p class="mt-2 text-neutral-600">Cada rubro tiene 3 diseños para elegir. Así se ven con datos de ejemplo.</p>
        @for (r of rubros; track r.id) {
          <h2 class="mb-3 mt-8 text-sm font-semibold uppercase tracking-wider text-neutral-500">{{ r.nombre }}</h2>
          <ul class="grid gap-3 sm:grid-cols-3">
            @for (d of r.disenos; track d.id) {
              <li><a [routerLink]="['/demo', r.id, d.id]" class="block h-full rounded-xl border border-neutral-300 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                <span class="mb-3 flex h-8 overflow-hidden rounded-md ring-1 ring-black/10" aria-hidden="true">
                  <span class="flex-1" [style.background]="d.tema.colores.fondo"></span><span class="flex-1" [style.background]="d.tema.colores.primario"></span>
                  <span class="flex-1" [style.background]="d.tema.colores.acento"></span>
                </span>
                <b class="block">{{ d.nombre }}</b>
                <span class="mt-1 block text-sm text-neutral-600">{{ d.resumen }}</span>
              </a></li>
            }
          </ul>
        }
        <p class="mt-8 text-sm text-neutral-500">Un negocio real se abre en <code>/n/su-slug</code>, con <code>?s=su-slug</code> o en su subdominio.</p>
      </main>
    }`,
})
export class InicioPage {
  /** Negocio al que apunta la dirección (subdominio o ?s=); null = página de inicio de la plataforma */
  protected readonly slug = inject(Entorno).slugActual();
  protected readonly rubros = [
    { id: 'cafeteria', nombre: 'Cafetería', disenos: DISENOS.cafeteria }, { id: 'barberia', nombre: 'Barbería', disenos: DISENOS.barberia },
    { id: 'perfumes', nombre: 'Perfumería', disenos: DISENOS.perfumes }, { id: 'salud', nombre: 'Salud', disenos: DISENOS.salud },
  ];

  constructor() {
    if (!this.slug) inject(SeoService).noIndexar('Plantillas de demostración');
  }
}
