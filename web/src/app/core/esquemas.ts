import { Rubro, Tema, TipoSeccion } from './models';

/* ---------- Esquemas de los formularios de cada sección ---------- */

export interface DefCampo {
  k: string;                       // ruta dentro de `datos` (admite "boton.texto")
  l: string;                       // etiqueta
  t: 'text' | 'area' | 'number' | 'imagen' | 'check';
  ayuda?: string;
  ph?: string;
  max?: number;
  solo?: Rubro[];                  // si se indica, solo esos rubros ven el campo
}
export interface DefLista {
  t: 'lista'; k: string; l: string; item: string;
  campos: DefCampo[]; vacio: Record<string, string>;
  solo?: Rubro[];
}
export interface DefImagenes { t: 'imagenes'; k: string; l: string; solo?: Rubro[]; }
export interface DefItems { t: 'items'; tipo: 'producto' | 'servicio' | 'miembro'; l: string; solo?: Rubro[]; }
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
      { k: 'cinta', l: 'Palabras de la cinta', t: 'text', ph: 'Corte clásico, Barba, Afeitado, Fade', max: 120, solo: ['barberia'],
        ayuda: 'La franja que se mueve bajo la portada. Sepáralas con comas; si lo dejas vacío usamos el nombre de tus servicios.' },
      { k: 'rating', l: 'Calificación', t: 'text', ph: '4.9 ★ · 320 reseñas', max: 40, solo: ['cafeteria'] },
      { k: 'stat.valor', l: 'Cifra destacada', t: 'number', ph: '12', solo: ['salud'] },
      { k: 'stat.prefijo', l: 'Prefijo de la cifra', t: 'text', ph: '+', max: 3, solo: ['salud'] },
      { k: 'stat.texto', l: 'Texto de la cifra', t: 'text', ph: 'años de experiencia', max: 40, solo: ['salud'] },
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
];

export const RADIOS: { id: string; valor: string; nombre: string }[] = [
  { id: 'recto', valor: '2px', nombre: 'Recto' },
  { id: 'suave', valor: '12px', nombre: 'Suave' },
  { id: 'redondo', valor: '20px', nombre: 'Redondo' },
];

export interface Paleta { nombre: string; colores: Tema['colores']; }

/** Paletas sugeridas por rubro (la primera es la de la plantilla original) */
export const PALETAS: Record<Rubro, Paleta[]> = {
  cafeteria: [
    { nombre: 'Café cálido', colores: { primario: '#6F4E37', acento: '#C8A27A', fondo: '#FBF6EF', texto: '#2B1D14' } },
    { nombre: 'Matcha', colores: { primario: '#3F6B4E', acento: '#A8C69F', fondo: '#F6F8F1', texto: '#1E2B22' } },
    { nombre: 'Terracota', colores: { primario: '#B4532A', acento: '#E9A87C', fondo: '#FFF7F0', texto: '#33180C' } },
    { nombre: 'Noche de café', colores: { primario: '#D9A066', acento: '#8B5E3C', fondo: '#1C1410', texto: '#F5EBDD' } },
  ],
  barberia: [
    { nombre: 'Negro y oro', colores: { primario: '#C9A227', acento: '#E5C65A', fondo: '#0D0D0D', texto: '#F2F2F2' } },
    { nombre: 'Rojo clásico', colores: { primario: '#C8352B', acento: '#F0B2AC', fondo: '#111111', texto: '#F5F5F5' } },
    { nombre: 'Azul marino', colores: { primario: '#E3B45B', acento: '#6B8FBF', fondo: '#0F1B2D', texto: '#EEF2F8' } },
    { nombre: 'Hueso y negro', colores: { primario: '#111111', acento: '#8A6D3B', fondo: '#F4F0E8', texto: '#161616' } },
  ],
  perfumes: [
    { nombre: 'Elegante', colores: { primario: '#1F1B24', acento: '#B08D57', fondo: '#FAF8F5', texto: '#1F1B24' } },
    { nombre: 'Rosé', colores: { primario: '#7A2E4A', acento: '#D8A7B1', fondo: '#FFF7F8', texto: '#2A1219' } },
    { nombre: 'Noche', colores: { primario: '#D4AF6A', acento: '#8E7CC3', fondo: '#14121C', texto: '#F1ECF7' } },
    { nombre: 'Marfil', colores: { primario: '#3D3A35', acento: '#A89F91', fondo: '#F7F4EF', texto: '#26231F' } },
  ],
  salud: [
    { nombre: 'Turquesa', colores: { primario: '#0E7C86', acento: '#5BC0BE', fondo: '#F6FBFB', texto: '#12333A' } },
    { nombre: 'Azul confianza', colores: { primario: '#2563EB', acento: '#93C5FD', fondo: '#F6F9FF', texto: '#13224A' } },
    { nombre: 'Verde vida', colores: { primario: '#15803D', acento: '#86EFAC', fondo: '#F5FBF7', texto: '#12301E' } },
    { nombre: 'Lavanda', colores: { primario: '#6D4FC2', acento: '#C4B5F5', fondo: '#FAF8FF', texto: '#241A44' } },
  ],
};
