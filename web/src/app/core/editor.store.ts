import { computed, inject, Injectable, signal } from '@angular/core';
import { Auth } from './auth.service';
import { defDiseno, disenoDe, estiloDe } from './disenos';
import { TIPOS_AGREGABLES, ESQUEMAS } from './esquemas';
import { Diseno, Item, LandingPublica, Redes, Rubro, Seccion, Tema, TipoSeccion } from './models';
import { limpiarRedes } from './redes';
import { setRuta } from './ruta';
import { supabase } from './supabase.client';

export interface DatosNegocio {
  nombre: string; whatsapp: string; logo_url: string | null; icono_url: string | null; email: string; telefono: string; direccion: string; redes: Redes;
}
export interface Seo { titulo?: string; descripcion?: string; imagen?: string; }
export type EstadoPublicacion = 'borrador' | 'cambios' | 'publicada';

const HEX = /^#[0-9a-f]{6}$/i;
const NOMBRE_NUEVO = { producto: 'Nuevo producto', servicio: 'Nuevo servicio', miembro: 'Nuevo integrante' } as const;

/** Estado del editor: borrador de la landing, datos del negocio, productos y publicación. */
@Injectable()
export class EditorStore {
  private readonly auth = inject(Auth);

  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly guardando = signal(false);
  readonly publicando = signal(false);

  private tenantId = '';
  readonly slug = signal('');
  readonly rubro = signal<Rubro>('cafeteria');
  readonly negocio = signal<DatosNegocio>({ nombre: '', whatsapp: '', logo_url: null, icono_url: null, email: '', telefono: '', direccion: '', redes: {} });
  readonly tema = signal<Tema>({ colores: { primario: '#4338ca', acento: '#818cf8', fondo: '#ffffff', texto: '#111111' }, fuentes: { titulos: 'Inter', texto: 'Inter' }, radio: '12px', diseno: 'a' });
  readonly secciones = signal<Seccion[]>([]);
  readonly seo = signal<Seo>({});
  readonly items = signal<Item[]>([]);
  readonly publicada = signal(false);
  /** Diseño elegido dentro del rubro y clave que usan los estilos (rubro-diseno) */
  readonly diseno = computed(() => disenoDe(this.tema()));
  readonly estilo = computed(() => estiloDe(this.rubro(), this.diseno()));

  /** Cuántos productos/servicios se están guardando en este momento */
  readonly itemsPendientes = signal(0);
  private readonly temporizadores = new Map<string, ReturnType<typeof setTimeout>>();

  private readonly guardable = computed(() => JSON.stringify({ n: this.negocio(), t: this.tema(), s: this.secciones(), o: this.seo() }));
  private readonly versionado = computed(() => JSON.stringify({ s: this.secciones(), t: this.tema(), o: this.seo() }));
  /** Hay cambios que no se han guardado */
  readonly sucio = computed(() => this.guardable() !== this.snapGuardadoSig());
  readonly estadoPublicacion = computed<EstadoPublicacion>(() => {
    if (!this.publicada()) return 'borrador';
    return this.versionado() !== this.snapPublicadoSig() ? 'cambios' : 'publicada';
  });
  private readonly snapGuardadoSig = signal('');
  private readonly snapPublicadoSig = signal('');

  /** Lo que se envía a la vista previa (igual a lo que devuelve landing_publica) */
  readonly vista = computed<LandingPublica>(() => {
    const n = this.negocio();
    return {
      nombre: n.nombre || 'Tu negocio', rubro: this.rubro(), whatsapp: n.whatsapp || null, logo_url: n.logo_url, icono_url: n.icono_url,
      email: n.email || null, telefono: n.telefono || null, direccion: n.direccion || null, redes: limpiarRedes(n.redes),
      tema: this.tema(), contenido: this.secciones(), seo: this.seo(),
      items: this.items().filter((i) => i.visible).sort((a, b) => a.orden - b.orden),
    };
  });

  readonly tiposDisponibles = computed<TipoSeccion[]>(() => {
    const usados = new Set(this.secciones().map((s) => s.tipo));
    return TIPOS_AGREGABLES.filter((t) => !usados.has(t));
  });

  /* ---------------- Carga ---------------- */

  async cargar(): Promise<void> {
    const id = this.auth.perfil()?.tenant_id;
    if (!id || !supabase) { this.errorCarga.set('No hay un negocio asociado a tu cuenta.'); this.cargando.set(false); return; }
    this.tenantId = id;

    const [t, l, it] = await Promise.all([
      supabase.from('tenants').select('slug, rubro, nombre, whatsapp, logo_url, icono_url, email, telefono, direccion, redes').eq('id', id).single(),
      supabase.from('landings').select('tema, borrador, publicado, tema_publicado, seo, seo_publicado, publicada').eq('tenant_id', id).single(),
      supabase.from('items').select('*').eq('tenant_id', id).order('tipo').order('orden'),
    ]);

    if (t.error || l.error || it.error || !t.data || !l.data) {
      const msg = l.error?.message ?? '';
      this.errorCarga.set(msg.includes('tema_publicado')
        ? 'Falta ejecutar el script supabase/09_publicacion_completa.sql en tu base de datos.'
        : 'No se pudo cargar tu landing. Recarga la página.');
      this.cargando.set(false);
      return;
    }

    const n = t.data;
    this.slug.set(n.slug);
    this.rubro.set(n.rubro as Rubro);
    this.negocio.set({
      nombre: n.nombre ?? '', whatsapp: n.whatsapp ?? '', logo_url: n.logo_url ?? null, icono_url: n.icono_url ?? null, email: n.email ?? '',
      telefono: n.telefono ?? '', direccion: n.direccion ?? '', redes: (n.redes ?? {}) as Redes,
    });
    this.tema.set(l.data.tema as Tema);
    // por si la base trae un tipo de sección que esta versión del editor no conoce
    this.secciones.set((l.data.borrador as Seccion[]).filter((s) => s.tipo in ESQUEMAS));
    this.seo.set((l.data.seo ?? {}) as Seo);
    this.items.set((it.data ?? []) as Item[]);
    this.publicada.set(!!l.data.publicada);

    this.snapGuardadoSig.set(this.guardable());
    this.snapPublicadoSig.set(l.data.publicada
      ? JSON.stringify({ s: l.data.publicado, t: l.data.tema_publicado ?? l.data.tema, o: l.data.seo_publicado ?? l.data.seo ?? {} })
      : '');
    this.cargando.set(false);
  }

  /* ---------------- Negocio ---------------- */

  setNegocio(parche: Partial<DatosNegocio>): void {
    this.negocio.update((n) => ({ ...n, ...parche }));
  }

  setRed(red: keyof Redes, url: string): void {
    this.negocio.update((n) => ({ ...n, redes: { ...n.redes, [red]: url } }));
  }

  setSeo(parche: Seo): void {
    this.seo.update((s) => ({ ...s, ...parche }));
  }

  /* ---------------- Diseño ---------------- */

  setColor(clave: keyof Tema['colores'], valor: string): void {
    if (!HEX.test(valor)) return;
    this.tema.update((t) => ({ ...t, colores: { ...t.colores, [clave]: valor } }));
  }

  setColores(colores: Tema['colores']): void {
    this.tema.update((t) => ({ ...t, colores: { ...colores } }));
  }

  setFuentes(titulos: string, texto: string): void {
    this.tema.update((t) => ({ ...t, fuentes: { titulos, texto } }));
  }

  setRadio(radio: string): void {
    this.tema.update((t) => ({ ...t, radio }));
  }

  /** Cambia de diseño: se aplican su paleta, tipografías y bordes; el contenido no se toca */
  setDiseno(d: Diseno): void {
    this.tema.set(structuredClone(defDiseno(this.rubro(), d).tema));
  }

  /** Vuelve a los colores, tipografías y bordes originales del diseño actual */
  restablecerTema(): void {
    this.tema.set(structuredClone(defDiseno(this.rubro(), this.diseno()).tema));
  }

  /* ---------------- Secciones ---------------- */

  setDato(id: string, ruta: string, valor: unknown): void {
    this.secciones.update((l) => l.map((s) => (s.id === id ? { ...s, datos: setRuta(s.datos, ruta, valor) } : s)));
  }

  alternarVisible(id: string): void {
    this.secciones.update((l) => l.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));
  }

  /** dir: -1 sube, +1 baja. La portada (posición 0) no se mueve ni se puede superar. */
  mover(id: string, dir: -1 | 1): void {
    this.secciones.update((l) => {
      const i = l.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 1 || j < 1 || j >= l.length) return l;
      const copia = [...l];
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });
  }

  eliminarSeccion(id: string): void {
    this.secciones.update((l) => l.filter((s) => s.id !== id || s.tipo === 'hero'));
  }

  /** Añade una sección nueva (antes del llamado final, si existe). Devuelve su id. */
  agregarSeccion(tipo: TipoSeccion): string {
    const ids = new Set(this.secciones().map((s) => s.id));
    let id: string = tipo;
    for (let n = 2; ids.has(id); n++) id = `${tipo}${n}`;
    const nueva: Seccion = { id, tipo, visible: true, datos: structuredClone(ESQUEMAS[tipo].inicial) };
    this.secciones.update((l) => {
      const fin = l.findIndex((s) => s.tipo === 'contacto');
      return tipo !== 'contacto' && fin > 0 ? [...l.slice(0, fin), nueva, ...l.slice(fin)] : [...l, nueva];
    });
    return id;
  }

  /* ---------------- Productos / servicios / equipo (se guardan al instante) ---------------- */

  itemsDe(tipo: Item['tipo']): Item[] {
    return this.items().filter((i) => i.tipo === tipo).sort((a, b) => a.orden - b.orden);
  }

  async agregarItem(tipo: Item['tipo'], categoria: string | null = null): Promise<boolean> {
    const orden = Math.max(0, ...this.items().filter((i) => i.tipo === tipo).map((i) => i.orden)) + 1;
    const { data, error } = await supabase!.from('items')
      .insert({ tenant_id: this.tenantId, tipo, nombre: NOMBRE_NUEVO[tipo], categoria, orden, extra: {} })
      .select('*').single();
    if (error || !data) return false;
    this.items.update((l) => [...l, data as Item]);
    return true;
  }

  /** Cambia el ítem en pantalla al instante y lo guarda 700 ms después de dejar de escribir */
  editarItem(id: string, parche: Partial<Item>): void {
    this.items.update((l) => l.map((i) => (i.id === id ? { ...i, ...parche } : i)));
    clearTimeout(this.temporizadores.get(id));
    if (!this.temporizadores.has(id)) this.itemsPendientes.update((n) => n + 1);
    this.temporizadores.set(id, setTimeout(() => void this.persistirItem(id), 700));
  }

  private async persistirItem(id: string): Promise<void> {
    this.temporizadores.delete(id);
    const i = this.items().find((x) => x.id === id);
    if (i) {
      await supabase!.from('items').update({
        categoria: i.categoria || null, nombre: i.nombre, descripcion: i.descripcion || null,
        precio: i.precio !== null && i.precio >= 0 ? i.precio : null, imagen_url: i.imagen_url,
        extra: i.extra, visible: i.visible, orden: i.orden,
      }).eq('id', id);
    }
    this.itemsPendientes.update((n) => Math.max(0, n - 1));
  }

  async eliminarItem(id: string): Promise<boolean> {
    const { error } = await supabase!.from('items').delete().eq('id', id);
    if (error) return false;
    clearTimeout(this.temporizadores.get(id));
    if (this.temporizadores.delete(id)) this.itemsPendientes.update((n) => Math.max(0, n - 1));
    this.items.update((l) => l.filter((i) => i.id !== id));
    return true;
  }

  moverItem(id: string, dir: -1 | 1): void {
    const item = this.items().find((i) => i.id === id);
    if (!item) return;
    const lista = this.itemsDe(item.tipo);
    const i = lista.findIndex((x) => x.id === id);
    const otro = lista[i + dir];
    if (!otro) return;
    this.editarItem(id, { orden: otro.orden });
    this.editarItem(otro.id, { orden: item.orden });
  }

  /* ---------------- Guardar y publicar ---------------- */

  /** Devuelve un mensaje de error, o null si se guardó */
  async guardar(): Promise<string | null> {
    const n = this.negocio();
    const wa = n.whatsapp.replace(/\D/g, '');
    if (!n.nombre.trim()) return 'Escribe el nombre de tu negocio (pestaña Negocio).';
    if (wa.length < 8) return 'Escribe un WhatsApp válido, con código de país (pestaña Negocio).';

    this.guardando.set(true);
    const guardable = this.guardable();
    const [a, b] = await Promise.all([
      supabase!.from('tenants').update({
        nombre: n.nombre.trim(), whatsapp: wa, logo_url: n.logo_url, icono_url: n.icono_url, email: n.email.trim() || null,
        telefono: n.telefono.trim() || null, direccion: n.direccion.trim() || null, redes: limpiarRedes(n.redes),
      }).eq('id', this.tenantId),
      supabase!.from('landings').update({ tema: this.tema(), borrador: this.secciones(), seo: this.seo() }).eq('tenant_id', this.tenantId),
    ]);
    this.guardando.set(false);
    if (a.error || b.error) return 'No se pudo guardar. Revisa tu conexión e intenta de nuevo.';
    this.snapGuardadoSig.set(guardable);
    return null;
  }

  async publicar(): Promise<string | null> {
    const error = await this.guardar();
    if (error) return error;
    this.publicando.set(true);
    const { error: e } = await supabase!.rpc('publicar_landing');
    this.publicando.set(false);
    if (e) return 'No se pudo publicar. Intenta de nuevo.';
    this.publicada.set(true);
    this.snapPublicadoSig.set(this.versionado());
    return null;
  }
}
