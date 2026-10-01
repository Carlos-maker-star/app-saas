import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { LandingStore } from '../core/landing.store';
import { LandingPublica } from '../core/models';
import { LandingVista } from '../sections/landing-vista';

/**
 * Se carga dentro de un <iframe> del editor. Recibe el borrador por postMessage (solo del mismo
 * origen) y lo pinta con los mismos componentes que la página pública. Al estar en un iframe,
 * los tamaños de pantalla (móvil/escritorio) son reales.
 */
@Component({
  selector: 'app-vista-previa',
  imports: [LandingVista],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (store.estado() === 'ok') { <app-landing-vista /> }
    @else { <div class="grid min-h-screen place-items-center text-neutral-500" role="status">Cargando vista previa…</div> }`,
})
export class VistaPreviaPage {
  protected readonly store = inject(LandingStore);

  constructor() {
    const origen = location.origin;

    const alMensaje = (e: MessageEvent) => {
      if (e.origin !== origen || e.source !== parent) return;
      const m = e.data as { tipo?: string; datos?: LandingPublica; id?: string };
      if (m?.tipo === 'borrador' && m.datos) this.store.mostrar(m.datos);
      // pequeña espera: la sección recién añadida tarda un instante en dibujarse
      if (m?.tipo === 'ir' && m.id) setTimeout(() => document.getElementById(m.id!)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 160);
    };

    // En la vista previa nada navega: los enlaces solo avisan al editor qué sección se tocó
    const alClic = (e: MouseEvent) => {
      const t = e.target as Element;
      const enlace = t.closest('a');
      if (enlace) {
        e.preventDefault();
        const href = enlace.getAttribute('href') ?? '';
        if (href.startsWith('#') && href.length > 1) document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      }
      const sec = t.closest('[data-sec]')?.getAttribute('data-sec');
      if (sec) parent.postMessage({ tipo: 'seccion', id: sec }, origen);
    };

    window.addEventListener('message', alMensaje);
    document.addEventListener('click', alClic, true);
    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('message', alMensaje);
      document.removeEventListener('click', alClic, true);
    });
    parent.postMessage({ tipo: 'listo' }, origen);
  }
}
