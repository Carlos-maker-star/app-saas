import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { nombreSeccion } from '../core/esquemas';
import { LandingStore } from '../core/landing.store';
import { Seccion } from '../core/models';
import { estiloTema } from '../core/tema';
import { Reveal } from '../shared/reveal';
import { Beneficios } from './beneficios';
import { Catalogo } from './catalogo';
import { Contacto } from './contacto';
import { Equipo } from './equipo';
import { Faq } from './faq';
import { Footer } from './footer';
import { Galeria } from './galeria';
import { Header } from './header';
import { Hero } from './hero';
import { Horarios } from './horarios';
import { Servicios } from './servicios';
import { Testimonios } from './testimonios';
import { WaFlotante } from './wa-flotante';

/** La landing ya renderizada (la usan la página pública y la vista previa del editor). */
@Component({
  selector: 'app-landing-vista',
  imports: [Reveal, Header, Hero, Catalogo, Servicios, Equipo, Galeria, Horarios, Contacto, Beneficios, Testimonios, Faq, Footer, WaFlotante],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="landing" [attr.data-rubro]="store.rubro()" [attr.data-estilo]="store.estilo()" [style]="estilo()">
      <app-header />
      <main>
        @for (s of store.secciones(); track s.id) {
          <div [id]="s.id" [attr.data-sec]="s.id" appReveal>
            @if (store.edicion() && vacia(s)) {
              <!-- Solo en la vista previa del editor: la página pública oculta las secciones vacías -->
              <div class="mx-auto my-6 max-w-6xl px-6">
                <div class="rounded-[var(--radius)] border-2 border-dashed border-line p-8 text-center">
                  <p class="fd m-0 text-xl">{{ s.datos['titulo'] || nombre(s) }}</p>
                  <p class="mx-auto mb-0 mt-2 max-w-md text-sm text-mute">Esta sección está vacía y no se verá en tu página. Añade contenido desde el editor.</p>
                </div>
              </div>
            } @else {
              @switch (s.tipo) {
                @case ('hero') { <app-hero [datos]="s.datos" /> }
                @case ('catalogo') { <app-catalogo [datos]="s.datos" /> }
                @case ('servicios') { <app-servicios [datos]="s.datos" /> }
                @case ('equipo') { <app-equipo [datos]="s.datos" /> }
                @case ('galeria') { <app-galeria [datos]="s.datos" /> }
                @case ('horarios') { <app-horarios [datos]="s.datos" /> }
                @case ('contacto') { <app-contacto [datos]="s.datos" /> }
                @case ('beneficios') { <app-beneficios [datos]="s.datos" /> }
                @case ('testimonios') { <app-testimonios [datos]="s.datos" /> }
                @case ('faq') { <app-faq [datos]="s.datos" /> }
              }
            }
          </div>
        }
      </main>
      <app-footer />
      <app-wa-flotante />
    </div>`,
})
export class LandingVista {
  protected readonly store = inject(LandingStore);
  protected readonly estilo = computed(() => {
    const t = this.store.datos()?.tema;
    return t ? estiloTema(t, this.store.rubro()) : {};
  });

  protected nombre = (s: Seccion) => nombreSeccion(s.tipo, this.store.rubro());

  /** ¿La sección no tiene nada que mostrar? (en la página pública, estas secciones se ocultan) */
  protected vacia(s: Seccion): boolean {
    const d = s.datos;
    const n = (v: unknown) => (Array.isArray(v) ? v.length : 0);
    switch (s.tipo) {
      case 'catalogo': return !this.store.itemsDe(d['tipo_item'] ?? 'producto').length;
      case 'servicios': return !this.store.itemsDe('servicio').length;
      case 'equipo': return !this.store.itemsDe('miembro').length;
      case 'horarios': return !n(d['dias']) && !this.store.direccion();
      case 'beneficios': case 'testimonios': case 'faq': return !n(d['items']);
      default: return false;
    }
  }
}
