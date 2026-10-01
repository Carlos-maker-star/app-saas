import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
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
        <p class="mt-2 text-neutral-600">Así se ve cada rubro con datos de ejemplo.</p>
        <ul class="mt-8 grid gap-3 sm:grid-cols-2">
          @for (r of rubros; track r.id) {
            <li><a [routerLink]="['/demo', r.id]" class="block rounded-xl border border-neutral-300 bg-white p-5 font-semibold transition hover:-translate-y-0.5 hover:shadow-md">{{ r.nombre }}</a></li>
          }
        </ul>
        <p class="mt-8 text-sm text-neutral-500">Un negocio real se abre en <code>/n/su-slug</code>, con <code>?s=su-slug</code> o en su subdominio.</p>
      </main>
    }`,
})
export class InicioPage {
  /** Negocio al que apunta la dirección (subdominio o ?s=); null = página de inicio de la plataforma */
  protected readonly slug = inject(Entorno).slugActual();
  protected readonly rubros = [
    { id: 'cafeteria', nombre: 'Cafetería' }, { id: 'barberia', nombre: 'Barbería' },
    { id: 'perfumes', nombre: 'Perfumería' }, { id: 'salud', nombre: 'Salud' },
  ];

  constructor() {
    if (!this.slug) inject(SeoService).noIndexar('Plantillas de demostración');
  }
}
