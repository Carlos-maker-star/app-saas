import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, makeStateKey, PendingTasks, RESPONSE_INIT, signal, TransferState } from '@angular/core';
import { datosDemo, RUBROS } from './demo-data';
import { Entorno } from './entorno';
import { env } from './env';
import { Item, LandingPublica, Redes, Rubro, Seccion } from './models';
import { SeoService } from './seo.service';
import { urlSegura } from './seguridad';
import { supabase } from './supabase.client';
import { cargarFuentes } from './tema';
import { buildWhatsAppUrl } from './whatsapp';

export type Estado = 'cargando' | 'ok' | 'no-disponible' | 'error';

/** Estado de la landing que se está mostrando; las secciones lo leen de aquí. */
@Injectable({ providedIn: 'root' })
export class LandingStore {
  private readonly doc = inject(DOCUMENT);
  private readonly entorno = inject(Entorno);
  private readonly seo = inject(SeoService);
  private readonly transfer = inject(TransferState);
  private readonly pendientes = inject(PendingTasks);
  /** Solo existe en el servidor: permite fijar el código HTTP (404, 503…) */
  private readonly respuesta = inject(RESPONSE_INIT, { optional: true });

  readonly datos = signal<LandingPublica | null>(null);
  readonly estado = signal<Estado>('cargando');
  readonly demo = signal(false);
  /** true dentro de la vista previa del editor: las secciones vacías se muestran como recuadro de ayuda */
  readonly edicion = signal(false);

  readonly rubro = computed<Rubro>(() => this.datos()?.rubro ?? 'cafeteria');
  readonly secciones = computed<Seccion[]>(() => (this.datos()?.contenido ?? []).filter((s) => s.visible));
  readonly nombre = computed(() => this.datos()?.nombre ?? '');
  readonly direccion = computed(() => this.datos()?.direccion ?? '');
  /** Solo las redes con URL https válida */
  readonly redes = computed(() => {
    const r: Redes = this.datos()?.redes ?? {};
    return (Object.entries(r) as [keyof Redes, string][])
      .map(([red, url]) => ({ red, url: urlSegura(url) }))
      .filter((x): x is { red: keyof Redes; url: string } => !!x.url);
  });

  itemsDe(tipo: Item['tipo']): Item[] {
    return (this.datos()?.items ?? []).filter((i) => i.tipo === tipo);
  }

  wa(mensaje: string, nombre?: string): string {
    return buildWhatsAppUrl(this.datos()?.whatsapp, mensaje, nombre);
  }

  cargarDemo(rubro: string): void {
    const r = RUBROS.find((x) => x === rubro) ?? 'cafeteria';
    this.demo.set(true);
    this.edicion.set(false);
    const d = datosDemo(r);
    this.poner(d);
    this.seo.noIndexar(`Demo · ${d.nombre}`); // las demos no se indexan
    this.seo.iconoNegocio(d);
  }

  /**
   * Carga la landing publicada de un negocio. En el servidor la pide a Supabase y deja los datos en
   * TransferState; en el navegador los toma de ahí (sin volver a pedirlos ni parpadear al hidratar).
   */
  async cargarSlug(slug: string): Promise<void> {
    this.demo.set(false);
    this.edicion.set(false);
    const clave = makeStateKey<LandingPublica | null>('landing:' + slug);

    if (this.transfer.hasKey(clave)) {
      const d = this.transfer.get(clave, null);
      this.transfer.remove(clave);
      this.resolver(slug, d);
      return;
    }

    this.estado.set('cargando');
    if (!supabase) { this.fallo(); return; }

    // PendingTasks: el servidor espera a que termine antes de generar el HTML
    await this.pendientes.run(async () => {
      const { data, error } = await supabase!.rpc('landing_publica', { p_slug: slug });
      if (error) { this.fallo(); return; }
      const d = (data as LandingPublica | null) ?? null;
      if (this.entorno.esServidor) this.transfer.set(clave, d);
      this.resolver(slug, d);
    });
  }

  /** Muestra datos que ya tenemos en memoria (la vista previa del editor) */
  mostrar(d: LandingPublica): void {
    this.demo.set(true); // recuadros de muestra en galerías vacías
    this.edicion.set(true);
    this.poner(d);
  }

  private resolver(slug: string, d: LandingPublica | null): void {
    if (!d) {
      this.datos.set(null);
      this.estado.set('no-disponible');
      this.codigo(404);
      this.seo.noIndexar('Página no disponible');
      return;
    }
    this.poner(d);
    this.seo.landing(d, this.urlCanonica(slug));
  }

  private fallo(): void {
    this.estado.set('error');
    this.codigo(503); // Google reintentará más tarde en vez de indexar un error
    this.seo.noIndexar('No pudimos cargar la página');
  }

  private codigo(status: number): void {
    if (this.respuesta) this.respuesta.status = status;
  }

  /** Dirección "oficial" de la landing: el subdominio si hay dominio base, si no /n/slug */
  private urlCanonica(slug: string): string {
    return env.dominioBase ? `https://${slug}.${env.dominioBase}/` : `${this.entorno.origen()}/n/${slug}`;
  }

  private poner(d: LandingPublica): void {
    this.datos.set(d);
    this.estado.set('ok');
    cargarFuentes(d.tema, this.doc);
  }
}
