import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MARCA } from '../core/marca';
import { LandingStore } from '../core/landing.store';
import { RedIcon } from '../shared/red-icon';

const NOMBRES: Record<string, string> = {
  instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube',
  x: 'X', linkedin: 'LinkedIn', web: 'Sitio web',
};

@Component({
  selector: 'app-footer',
  imports: [RedIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-line px-6 py-8 text-center text-sm text-mute">
      @if (store.redes().length) {
        <ul class="mb-4 flex justify-center gap-5">
          @for (r of store.redes(); track r.red) {
            <li><a [href]="r.url" target="_blank" rel="noopener noreferrer" class="inline-block transition hover:-translate-y-0.5 hover:text-brand"
                   [attr.aria-label]="nombre(r.red)"><app-red-icon [red]="r.red" /></a></li>
          }
        </ul>
      }
      @if (store.datos(); as d) {
        @if (d.telefono || d.email) { <p class="mb-1">{{ d.telefono }}@if (d.telefono && d.email) { · }{{ d.email }}</p> }
      }
      <p>© {{ anio }} {{ store.nombre() }}</p>
      <p class="mt-2 text-xs opacity-70">Página creada con <a href="/" class="underline-offset-2 hover:underline">{{ marca }}</a> · <a href="/terminos" class="underline-offset-2 hover:underline">Términos</a> · <a href="/privacidad" class="underline-offset-2 hover:underline">Privacidad</a></p>
    </footer>`,
})
export class Footer {
  protected readonly store = inject(LandingStore);
  protected readonly marca = MARCA.nombre;
  protected readonly anio = new Date().getFullYear();
  protected nombre = (r: string) => NOMBRES[r] ?? r;
}
