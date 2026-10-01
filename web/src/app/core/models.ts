export type Rubro = 'cafeteria' | 'barberia' | 'perfumes' | 'salud';

export type TipoSeccion =
  | 'hero' | 'catalogo' | 'servicios' | 'equipo' | 'galeria' | 'horarios'
  | 'contacto' | 'beneficios' | 'testimonios' | 'faq';

/** Datos de una sección: su forma depende del tipo (ver sections/*); el JSON viene de la base de datos */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DatosSeccion = any;

export interface Seccion {
  id: string;
  tipo: TipoSeccion;
  visible: boolean;
  datos: DatosSeccion;
}

export interface Tema {
  colores: { primario: string; acento: string; fondo: string; texto: string };
  fuentes: { titulos: string; texto: string };
  radio: string;
}

export interface Item {
  id: string;
  tipo: 'producto' | 'servicio' | 'miembro';
  categoria: string | null;
  nombre: string;
  descripcion: string | null;
  precio: number | null;
  imagen_url: string | null;
  extra: Record<string, string>;
  orden: number;
  visible: boolean;
}

export type Redes = Partial<Record<
  'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'x' | 'linkedin' | 'web', string>>;

/** Respuesta de la función SQL landing_publica(slug) */
export interface LandingPublica {
  nombre: string;
  rubro: Rubro;
  whatsapp: string | null;
  logo_url: string | null;
  /** Icono de la pestaña subido por el cliente (si no, se genera uno según el rubro) */
  icono_url?: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  redes: Redes;
  tema: Tema;
  contenido: Seccion[];
  seo: { titulo?: string; descripcion?: string; imagen?: string };
  items: Item[];
}
