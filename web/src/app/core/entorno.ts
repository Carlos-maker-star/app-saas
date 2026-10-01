import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, REQUEST } from '@angular/core';
import { env } from './env';
import { slugDeHost } from './seo';

/** Datos de la petición que funcionan igual en el servidor (SSR) y en el navegador. */
@Injectable({ providedIn: 'root' })
export class Entorno {
  private readonly req = inject(REQUEST, { optional: true });
  private readonly doc = inject(DOCUMENT);
  readonly esServidor = !isPlatformBrowser(inject(PLATFORM_ID));

  private url(): URL | null {
    try {
      return new URL(this.req?.url ?? this.doc.location?.href ?? '');
    } catch {
      return null;
    }
  }

  /** "https://host" sin barra final. Fuera de localhost siempre https. */
  origen(): string {
    const u = this.url();
    if (!u) return '';
    const local = u.hostname === 'localhost' || u.hostname.endsWith('.localhost');
    return `${local ? u.protocol : 'https:'}//${u.host}`;
  }

  /** Negocio al que apunta la petición: por subdominio (cliente.tuapp.com) o por ?s=cliente */
  slugActual(): string | null {
    const u = this.url();
    if (!u) return null;
    return slugDeHost(u.hostname, env.dominioBase) ?? u.searchParams.get('s');
  }
}
