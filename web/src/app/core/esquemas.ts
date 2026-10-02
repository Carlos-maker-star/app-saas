import { DISENOS, Paleta } from './disenos';
import { Rubro, TipoSeccion } from './models';

/* ---------- Esquemas de los formularios de cada sección ---------- */

export interface DefCampo {
  k: string;                       // ruta dentro de `datos` (admite "boton.texto")
  l: string;                       // etiqueta
  t: 'text' | 'area' | 'number' | 'imagen' | 'check';
  ayuda?: string;
  ph?: string;
  max?: number;
  solo?: Rubro[];                  // si se indica, solo esos rubros ven el campo
  estilos?: string[];              // si se indica, solo esos diseños lo usan (clave "rubro-diseno", p. ej. "cafeteria-b")
}
export interface DefLista {
  t: 'lista'; k: string; l: string; item: string;
  campos: DefCampo[]; vacio: Record<string, string>;
  solo?: Rubro[]; estilos?: string[];
}
export interface DefImagenes { t: 'imagenes'; k: string; l: string; solo?: Rubro[]; estilos?: string[]; }
export interface DefItems { t: 'items'; tipo: 'producto' | 'servicio' | 'miembro'; l: string; solo?: Rubro[]; estilos?: string[]; }
export type DefElemento = DefCampo | DefLista | DefImagenes | DefItems;

export interface DefSeccion {
  nombre: string;
  icono: string;
  descripcion: string;
  elementos: DefElemento[];
  /** Datos iniciales al añadir la sección */
  inicial: Record<string, unknown>;
}

const titulo = (ph: string): DefCampo => ({ k: 'titulo', l: 'Título de la sección', t: 'text', ph, max: 60 });
const wa = (ph: string): DefCampo[] => [
  { k: 'boton_item', l: 'Texto del botón de cada ítem', t: 'text', ph, max: 20 },
  { k: 'mensaje_item', l: 'Mensaje de WhatsApp', t: 'area', ayuda: 'Usa {nombre} para poner el nombre del ítem.', max: 160 },
];

export const ESQUEMAS: Record<TipoSeccion, DefSeccion> = {
  hero: {
    nombre: 'Portada', icono: 'layout', descripcion: 'Lo primero que ve el visitante.',
    elementos: [
      { k: 'etiqueta', l: 'Frase corta superior', t: 'text', ph: 'Ej. Desde 2015 · Arequipa', max: 50 },
      { k: 'titulo', l: 'Título principal', t: 'text', max: 80 },
      { k: 'subtitulo', l: 'Subtítulo', t: 'area', max: 200 },
      { k: 'imagen', l: 'Foto principal', t: 'imagen' },
      { k: 'boton.texto', l: 'Texto del botón', t: 'text', max: 40 },
      { k: 'boton.mensaje', l: 'Mensaje de WhatsApp', t: 'area', ayuda: 'Lo que se escribirá al tocar el botón.', max: 160 },
      { k: 'cinta', l: 'Palabras de la cinta', t: 'text', ph: 'Corte clásico, Barba, Afeitado, Fade', max: 120, estilos: ['barberia-a', 'cafeteria-c'],
        ayuda: 'La franja que se mueve bajo la portada. Sepáralas con comas; si lo dejas vacío usamos el nombre de tus servicios o productos.' },
      { k: 'rating', l: 'Calificación', t: 'text', ph: '4.9 ★ · 320 reseñas', max: 40, estilos: ['cafeteria-a', 'salud-b'] },
      { k: 'stat.valor', l: 'Cifra destacada', t: 'number', ph: '12', estilos: ['salud-a', 'salud-c'] },
      { k: 'stat.prefijo', l: 'Prefijo de la cifra', t: 'text', ph: '+', max: 3, estilos: ['salud-a', 'salud-c'] },
      { k: 'stat.texto', l: 'Texto de la cifra', t: 'text', ph: 'años de experiencia', max: 40, estilos: ['salud-a', 'salud-c'] },
      { k: 'horas', l: 'Horas de la agenda', t: 'text', ph: '09:00, 10:30, 12:00, 15:00, 16:30, 18:00', max: 120, estilos: ['salud-c'],
        ayuda: 'Las horas que se ofrecen en la agenda de la portada. Sepáralas con comas.' },
      { k: 'ficha_titulo', l: 'Título de la etiqueta', t: 'text', ph: 'Chanchamayo Honey Caturra', max: 40, estilos: ['cafeteria-b'],
        ayuda: 'La etiqueta de bolsa de la portada: el grano o la especialidad de la semana.' },
      { k: 'ficha_subtitulo', l: 'Línea sobre el título', t: 'text', ph: 'Café en grano · 250 g', max: 40, estilos: ['cafeteria-b'] },
      { t: 'lista', k: 'ficha', l: 'Datos de la etiqueta', item: 'Dato', estilos: ['cafeteria-b'], campos: [
        { k: 'clave', l: 'Nombre', t: 'text', ph: 'Altura', max: 20 }, { k: 'valor', l: 'Valor', t: 'text', ph: '1 800 msnm', max: 30 },
      ], vacio: { clave: '', valor: '' } },
    ],
    inicial: {},
  },
  catalogo: {
    nombre: 'Catálogo', icono: 'store', descripcion: 'Tus productos, cada uno con botón de WhatsApp.',
    elementos: [
      titulo('Nuestra carta'),
      { k: 'subtitulo', l: 'Subtítulo', t: 'text', max: 100, solo: ['cafeteria'] },
      { k: 'moneda', l: 'Moneda', t: 'text', ph: 'S/', max: 5 },
      ...wa('Pedir'),
      { t: 'items', tipo: 'producto', l: 'Productos' },
    ],
    inicial: { titulo: 'Catálogo', tipo_item: 'producto', moneda: 'S/', boton_item: 'Consultar', mensaje_item: 'Hola, me interesa: {nombre}' },
  },
  servicios: {
    nombre: 'Servicios', icono: 'heart', descripcion: 'Lo que ofreces, con precio opcional.',
    elementos: [
      titulo('Servicios y precios'),
      { k: 'moneda', l: 'Moneda', t: 'text', ph: 'S/', max: 5 },
      ...wa('Reservar'),
      { t: 'items', tipo: 'servicio', l: 'Servicios' },
    ],
    inicial: { titulo: 'Servicios', moneda: 'S/', boton_item: 'Consultar', mensaje_item: 'Hola, quisiera consultar: {nombre}' },
  },
  equipo: {
    nombre: 'Equipo', icono: 'users', descripcion: 'Las personas detrás del negocio.',
    elementos: [titulo('Nuestro equipo'), { t: 'items', tipo: 'miembro', l: 'Integrantes' }],
    inicial: { titulo: 'Nuestro equipo' },
  },
  galeria: {
    nombre: 'Galería', icono: 'palette', descripcion: 'Fotos de tu local o de tus trabajos.',
    elementos: [titulo('Nuestros trabajos'), { t: 'imagenes', k: 'imagenes', l: 'Fotos' }],
    inicial: { titulo: 'Galería', imagenes: [] },
  },
  horarios: {
    nombre: 'Horarios y ubicación', icono: 'home', descripcion: 'Cuándo y dónde atiendes. La dirección se edita en "Negocio".',
    elementos: [
      titulo('Horarios'),
      { t: 'lista', k: 'dias', l: 'Horarios', item: 'Horario', campos: [
        { k: 'dia', l: 'Días', t: 'text', ph: 'Lun – Vie', max: 30 }, { k: 'hora', l: 'Horario', t: 'text', ph: '8:00 – 18:00', max: 30 },
      ], vacio: { dia: '', hora: '' } },
    ],
    inicial: { titulo: 'Horarios', dias: [] },
  },
  contacto: {
    nombre: 'Llamado final', icono: 'rocket', descripcion: 'Franja de color al final, para animar a escribirte.',
    elementos: [
      titulo('Reserva tu turno'),
      { k: 'texto', l: 'Texto de apoyo', t: 'text', max: 100 },
      { k: 'boton', l: 'Texto del botón', t: 'text', max: 40 },
      { k: 'mensaje', l: 'Mensaje de WhatsApp', t: 'area', max: 160 },
    ],
    inicial: { titulo: '¿Hablamos?', texto: 'Escríbenos y te respondemos.', boton: 'Escribir por WhatsApp', mensaje: 'Hola, quisiera más información.' },
  },
  beneficios: {
    nombre: 'Beneficios', icono: 'check', descripcion: 'Tres o cuatro razones para elegirte.',
    elementos: [
      { t: 'lista', k: 'items', l: 'Beneficios', item: 'Beneficio', campos: [
        { k: 'titulo', l: 'Título', t: 'text', max: 40 }, { k: 'texto', l: 'Descripción', t: 'area', max: 120 },
      ], vacio: { titulo: '', texto: '' } },
    ],
    inicial: { items: [] },
  },
  testimonios: {
    nombre: 'Opiniones', icono: 'users', descripcion: 'Lo que dicen tus clientes (reales, por favor).',
    elementos: [
      titulo('Lo que dicen nuestros clientes'),
      { t: 'lista', k: 'items', l: 'Opiniones', item: 'Opinión', campos: [
        { k: 'texto', l: 'Comentario', t: 'area', max: 200 }, { k: 'nombre', l: 'Nombre', t: 'text', max: 40 },
      ], vacio: { texto: '', nombre: '' } },
    ],
    inicial: { titulo: 'Opiniones', items: [] },
  },
  faq: {
    nombre: 'Preguntas frecuentes', icono: 'alert', descripcion: 'Resuelve dudas antes de que te escriban.',
    elementos: [
      titulo('Preguntas frecuentes'),
      { t: 'lista', k: 'items', l: 'Preguntas', item: 'Pregunta', campos: [
        { k: 'pregunta', l: 'Pregunta', t: 'text', max: 100 }, { k: 'respuesta', l: 'Respuesta', t: 'area', max: 300 },
      ], vacio: { pregunta: '', respuesta: '' } },
    ],
    inicial: { titulo: 'Preguntas frecuentes', items: [] },
  },
};

/** Tipos que se pueden añadir (la portada siempre existe) */
export const TIPOS_AGREGABLES: TipoSeccion[] = ['catalogo', 'servicios', 'equipo', 'galeria', 'horarios', 'beneficios', 'testimonios', 'faq', 'contacto'];

export function nombreSeccion(tipo: TipoSeccion, rubro: Rubro): string {
  if (tipo === 'catalogo') return rubro === 'cafeteria' ? 'Carta' : 'Catálogo';
  return ESQUEMAS[tipo].nombre;
}

/* ---------- Diseño ---------- */

export const FUENTES: { id: string; titulos: string; texto: string; estilo: string }[] = [
  { id: 'playfair', titulos: 'Playfair Display', texto: 'Inter', estilo: 'Elegante y clásica' },
  { id: 'oswald', titulos: 'Oswald', texto: 'Inter', estilo: 'Fuerte y condensada' },
  { id: 'cormorant', titulos: 'Cormorant Garamond', texto: 'Inter', estilo: 'Refinada y editorial' },
  { id: 'poppins', titulos: 'Poppins', texto: 'Inter', estilo: 'Moderna y amable' },
  { id: 'fraunces', titulos: 'Fraunces', texto: 'Inter', estilo: 'Cálida con carácter' },
  { id: 'montserrat', titulos: 'Montserrat', texto: 'Inter', estilo: 'Limpia y geométrica' },
  { id: 'space', titulos: 'Space Grotesk', texto: 'Inter', estilo: 'Técnica y actual' },
  { id: 'lora', titulos: 'Lora', texto: 'Inter', estilo: 'Serif suave' },
  { id: 'bricolage', titulos: 'Bricolage Grotesque', texto: 'Inter', estilo: 'Gruesa y juguetona' },
  { id: 'bodoni', titulos: 'Bodoni Moda', texto: 'Inter', estilo: 'Lujo y contraste' },
  { id: 'instrument', titulos: 'Instrument Serif', texto: 'Inter', estilo: 'Editorial elegante' },
  { id: 'newsreader', titulos: 'Newsreader', texto: 'Inter', estilo: 'Periodística' },
  { id: 'alfa', titulos: 'Alfa Slab One', texto: 'Inter', estilo: 'Rotulada, de barbería antigua' },
  { id: 'archivo', titulos: 'Archivo Black', texto: 'Inter', estilo: 'Pesada y callejera' },
];

export const RADIOS: { id: string; valor: string; nombre: string }[] = [
  { id: 'recto', valor: '2px', nombre: 'Recto' },
  { id: 'suave', valor: '12px', nombre: 'Suave' },
  { id: 'redondo', valor: '20px', nombre: 'Redondo' },
];

export type { Paleta };

/** Paletas sugeridas del diseño 'a' de cada rubro (los otros diseños traen las suyas: ver core/disenos.ts) */
export const PALETAS: Record<Rubro, Paleta[]> = {
  cafeteria: DISENOS.cafeteria[0].paletas,
  barberia: DISENOS.barberia[0].paletas,
  perfumes: DISENOS.perfumes[0].paletas,
  salud: DISENOS.salud[0].paletas,
};
