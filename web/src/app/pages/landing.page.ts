import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { LandingStore } from '../core/landing.store';
import { LandingVista } from '../sections/landing-vista';

/**
 * Landing pública. Se usa con `slug` (negocio real) o con `rubro` (demo sin Supabase).
 */
@Component({
  selector: 'app-landing',
  imports: [LandingVista],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (store.estado()) {
      @case ('ok') { <app-landing-vista /> }
      @case ('cargando') {
        <div class="grid min-h-screen place-items-center text-neutral-500" role="status">Cargando…</div>
      }
      @case ('no-disponible') {
        <div class="grid min-h-screen place-items-center px-6 text-center">
          <div>
            <h1 class="text-3xl font-bold">Página no disponible</h1>
            <p class="mt-2 text-neutral-600">Esta página no existe o no está publicada por el momento.</p>
          </div>
        </div>
      }
      @default {
        <div class="grid min-h-screen place-items-center px-6 text-center">
          <div>
            <h1 class="text-3xl font-bold">No pudimos cargar la página</h1>
            <p class="mt-2 text-neutral-600">Intenta de nuevo en unos minutos.</p>
          </div>
        </div>
      }
    }`,
})
export class LandingPage {
  protected readonly store = inject(LandingStore);
  readonly slug = input<string>();
  readonly rubro = input<string>();

  constructor() {
    effect(() => {
      const slug = this.slug();
      const rubro = this.rubro();
      if (slug) void this.store.cargarSlug(slug);
      else if (rubro) this.store.cargarDemo(rubro);
    });
  }
}
