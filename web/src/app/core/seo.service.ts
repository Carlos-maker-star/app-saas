import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { COLOR_PLATAFORMA, colorHex, urlIconoRubro } from './icono';
import { LandingPublica } from './models';
import { jsonLd, jsonSeguro, metaLanding } from './seo';
import { urlSegura } from './seguridad';

/** Icono de la plataforma (login, panel, admin): una ventana de landing en índigo */
const ICONOS_PLATAFORMA = [
  { rel: 'icon', type: 'image/svg+xml', href: 'favicon.svg' },
  { rel: 'icon', type: 'image/x-icon', sizes: '48x48', href: 'favicon.ico' },
  { rel: 'apple-touch-icon', href: 'apple-touch-icon.png' },
];

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
    this.iconoNegocio(d);
  }

  /** Icono de la pestaña: el que subió el cliente; si no, uno de su rubro con los colores de su marca. */
  iconoNegocio(d: LandingPublica): void {
    const propio = urlSegura(d.icono_url);
    this.iconos(propio
      ? [{ rel: 'icon', href: propio }, { rel: 'apple-touch-icon', href: propio }]
      : [{ rel: 'icon', type: 'image/svg+xml', href: urlIconoRubro(d.rubro, d.tema.colores.primario) }]);
    this.nombre('theme-color', colorHex(d.tema.colores.primario, COLOR_PLATAFORMA));
  }

  /** Demos, errores y páginas no disponibles: no deben aparecer en Google */
  noIndexar(titulo: string): void {
    this.title.setTitle(titulo);
    this.nombre('robots', 'noindex,nofollow');
    this.nombre('description', null);
    this.datosEstructurados(null);
    this.enlaceCanonico(null);
    for (const p of ['og:type', 'og:site_name', 'og:locale', 'og:title', 'og:description', 'og:url', 'og:image']) this.propiedad(p, null);
    for (const n of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'theme-color']) this.nombre(n, null);
    this.iconos(ICONOS_PLATAFORMA); // fuera de una landing real vuelve el icono de la plataforma
  }

  private iconos(lista: { rel: string; href: string; type?: string; sizes?: string }[]): void {
    this.doc.head.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach((l) => l.remove());
    for (const i of lista) {
      const l = this.doc.createElement('link');
      l.setAttribute('rel', i.rel);
      l.setAttribute('href', i.href);
      if (i.type) l.setAttribute('type', i.type);
      if (i.sizes) l.setAttribute('sizes', i.sizes);
      this.doc.head.appendChild(l);
    }
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
