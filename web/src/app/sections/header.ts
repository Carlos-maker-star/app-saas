import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LandingStore } from '../core/landing.store';
import { urlSegura } from '../core/seguridad';
import { TipoSeccion } from '../core/models';

const ETIQUETAS: Partial<Record<TipoSeccion, string>> = {
  catalogo: 'Catálogo', servicios: 'Servicios', equipo: 'Equipo', galeria: 'Galería',
  horarios: 'Horarios', faq: 'Preguntas', beneficios: 'Nosotros', testimonios: 'Opiniones',
};

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-40 border-b border-line backdrop-blur"
            style="background: color-mix(in srgb, var(--bg) 88%, transparent)">
      <div class="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
        <a href="#" class="flex items-center gap-2" [attr.aria-label]="store.nombre()">
          @if (logo(); as src) { <img [src]="src" [alt]="store.nombre()" class="h-9 w-auto"> }
          @else { <span [class]="marca()">{{ store.nombre() }}</span> }
        </a>
        <nav class="ml-auto hidden gap-6 text-sm text-mute md:flex" aria-label="Secciones">
          @for (l of enlaces(); track l.id) { <a class="nav-link u-link hover:text-ink" [href]="'#' + l.id">{{ l.texto }}</a> }
        </nav>
        <a class="btn btn-sm ml-auto shrink-0 md:ml-0" [href]="store.wa(mensaje())" target="_blank" rel="noopener">{{ boton() }}</a>
      </div>
    </header>`,
})
export class Header {
  protected readonly store = inject(LandingStore);
  protected readonly logo = computed(() => urlSegura(this.store.datos()?.logo_url));
  protected readonly marca = computed(() => {
    const r = this.store.rubro();
    const base = 'fd text-2xl font-bold ';
    return r === 'barberia' ? base + 'uppercase tracking-[.2em] text-brand'
         : r === 'perfumes' ? base + 'uppercase tracking-[.25em]'
         : base + 'text-brand';
  });
  protected readonly enlaces = computed(() =>
    this.store.secciones().filter((s) => ETIQUETAS[s.tipo]).slice(0, 5)
      .map((s) => ({ id: s.id, texto: ETIQUETAS[s.tipo]! })));
  private readonly cta = computed(() => this.store.secciones().find((s) => s.tipo === 'hero')?.datos['boton']);
  protected readonly mensaje = computed(() => this.cta()?.mensaje ?? 'Hola, quisiera más información.');
  protected readonly boton = computed(() => {
    const r = this.store.rubro();
    return r === 'cafeteria' ? 'Pedir' : r === 'perfumes' ? 'Consultar' : 'Agendar';
  });
}
