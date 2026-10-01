import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { LandingPublica } from './models';
import { jsonLd, jsonSeguro, metaLanding } from './seo';

/** Pone en <head> lo que lee Google y las vistas previas al compartir el enlace (también en el servidor). */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  /** Landing real publicada: se indexa */
  landing(d: LandingPublica, url: string): void {
    const m = metaLanding(d);
    this.title.setTitle(m.titulo);
    this.nombre('description', m.descripcion);
    this.nombre('robots', 'index,follow,max-image-preview:large');
    this.enlaceCanonico(url);

    this.propiedad('og:type', 'website');
    this.propiedad('og:site_name', d.nombre);
    this.propiedad('og:locale', 'es_ES');
    this.propiedad('og:title', m.titulo);
    this.propiedad('og:description', m.descripcion);
    this.propiedad('og:url', url);
    this.propiedad('og:image', m.imagen);
    this.nombre('twitter:card', m.imagen ? 'summary_large_image' : 'summary');
    this.nombre('twitter:title', m.titulo);
    this.nombre('twitter:description', m.descripcion);
    this.nombre('twitter:image', m.imagen);

    this.datosEstructurados(jsonSeguro(jsonLd(d, url)));
  }

  /** Demos, errores y páginas no disponibles: no deben aparecer en Google */
  noIndexar(titulo: string): void {
    this.title.setTitle(titulo);
    this.nombre('robots', 'noindex,nofollow');
    this.nombre('description', null);
    this.datosEstructurados(null);
    this.enlaceCanonico(null);
    for (const p of ['og:type', 'og:site_name', 'og:locale', 'og:title', 'og:description', 'og:url', 'og:image']) this.propiedad(p, null);
    for (const n of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) this.nombre(n, null);
  }

  private nombre(name: string, content: string | null): void {
    if (content) this.meta.updateTag({ name, content });
    else this.meta.removeTag(`name='${name}'`);
  }

  private propiedad(property: string, content: string | null): void {
    if (content) this.meta.updateTag({ property, content });
    else this.meta.removeTag(`property='${property}'`);
  }

  private enlaceCanonico(url: string | null): void {
    let l = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!url) { l?.remove(); return; }
    if (!l) {
      l = this.doc.createElement('link');
      l.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(l);
    }
    l.setAttribute('href', url);
  }

  private datosEstructurados(json: string | null): void {
    this.doc.head.querySelector('script[data-ld]')?.remove();
    if (!json) return;
    const s = this.doc.createElement('script');
    s.setAttribute('type', 'application/ld+json');
    s.setAttribute('data-ld', '');
    s.textContent = json;
    this.doc.head.appendChild(s);
  }
}
