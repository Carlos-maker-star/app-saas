import { LandingPublica, Rubro } from './models';
import { urlSegura } from './seguridad';

/** Tipo de negocio según schema.org (lo que entiende Google) */
export const TIPO_NEGOCIO: Record<Rubro, string> = {
  cafeteria: 'CafeOrCoffeeShop',
  barberia: 'HairSalon',
  perfumes: 'Store',
  salud: 'MedicalBusiness',
};

export const ETIQUETA_RUBRO: Record<Rubro, string> = {
  cafeteria: 'Cafetería', barberia: 'Barbería', perfumes: 'Perfumería', salud: 'Salud',
};

export function recortar(texto: string, max: number): string {
  const t = texto.replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : t.slice(0, max - 1).trimEnd() + '…';
}

export interface MetaLanding { titulo: string; descripcion: string; imagen: string | null; }

/** Título, descripción e imagen para Google y para compartir; lo que el dueño no puso se deduce. */
export function metaLanding(d: LandingPublica): MetaLanding {
  const hero = d.contenido?.find((s) => s.tipo === 'hero')?.datos ?? {};
  const titulo = d.seo?.titulo?.trim() || `${d.nombre} · ${ETIQUETA_RUBRO[d.rubro]}`;
  const descripcion = recortar(
    d.seo?.descripcion?.trim() || String(hero['subtitulo'] ?? '').trim() || `${d.nombre}. Escríbenos por WhatsApp.`, 160);
  const imagen = urlSegura(d.seo?.imagen) ?? urlSegura(hero['imagen']) ?? urlSegura(d.logo_url);
  return { titulo: recortar(titulo, 70), descripcion, imagen };
}

/** Datos estructurados "negocio local" (JSON-LD) */
export function jsonLd(d: LandingPublica, url: string): Record<string, unknown> {
  const m = metaLanding(d);
  const tel = d.telefono?.trim() || (d.whatsapp ? '+' + d.whatsapp.replace(/\D/g, '') : '');
  const redes = Object.values(d.redes ?? {}).map(urlSegura).filter((u): u is string => !!u);
  const o: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': TIPO_NEGOCIO[d.rubro],
    name: d.nombre,
    description: m.descripcion,
    url,
  };
  if (m.imagen) o['image'] = m.imagen;
  if (tel) o['telephone'] = tel;
  if (d.email) o['email'] = d.email;
  if (d.direccion) o['address'] = { '@type': 'PostalAddress', streetAddress: d.direccion };
  if (redes.length) o['sameAs'] = redes;
  return o;
}

/** JSON listo para ir dentro de <script>: `<` escapado para que ningún texto pueda cerrar la etiqueta */
export function jsonSeguro(o: unknown): string {
  return JSON.stringify(o)
    .replace(/</g, '\\u003c')
    .split(String.fromCharCode(0x2028)).join('\\u2028')
    .split(String.fromCharCode(0x2029)).join('\\u2029');
}

const RESERVADOS = ['www', 'app', 'admin', 'api', 'panel', 'localhost'];

/** "cafe.tuapp.com" con base "tuapp.com" → "cafe". Devuelve null si no es el subdominio de un negocio. */
export function slugDeHost(host: string, dominioBase: string): string | null {
  const h = host.toLowerCase().split(':')[0];
  const base = dominioBase.toLowerCase();
  if (!base || !h.endsWith('.' + base)) return null;
  const sub = h.slice(0, -(base.length + 1));
  return sub && !sub.includes('.') && !RESERVADOS.includes(sub) ? sub : null;
}
