import { Diseno, Rubro, Tema } from './models';

/**
 * Los 3 diseños de cada rubro. Cada uno trae su paleta, sus tipografías y su forma de bordes;
 * la composición de la portada y de las secciones principales cambia con el diseño (ver sections/).
 * El cliente elige uno en el editor y luego puede ajustar colores, tipografía y bordes.
 */

export interface Paleta { nombre: string; colores: Tema['colores']; }

export interface DisenoDef {
  id: Diseno;
  nombre: string;
  resumen: string;
  /** Tema que se aplica al elegir el diseño */
  tema: Tema;
  /** Paletas sugeridas para este diseño (la primera es la original) */
  paletas: Paleta[];
  /** Tipografías extra que usa el diseño para etiquetas (se cargan junto con las del tema) */
  extras?: string[];
}

const c = (primario: string, acento: string, fondo: string, texto: string): Tema['colores'] => ({ primario, acento, fondo, texto });
const t = (diseno: Diseno, colores: Tema['colores'], titulos: string, texto: string, radio: string): Tema => ({ colores, fuentes: { titulos, texto }, radio, diseno });

export const DISENOS: Record<Rubro, DisenoDef[]> = {
  cafeteria: [
    { id: 'a', nombre: 'Clásico cálido', resumen: 'Crema y café, tipografía con serifa, taza con vapor.',
      tema: t('a', c('#6F4E37', '#C8A27A', '#FBF6EF', '#2B1D14'), 'Playfair Display', 'Inter', '12px'),
      paletas: [
        { nombre: 'Café cálido', colores: c('#6F4E37', '#C8A27A', '#FBF6EF', '#2B1D14') },
        { nombre: 'Matcha', colores: c('#3F6B4E', '#A8C69F', '#F6F8F1', '#1E2B22') },
        { nombre: 'Terracota', colores: c('#B4532A', '#E9A87C', '#FFF7F0', '#33180C') },
        { nombre: 'Noche de café', colores: c('#D9A066', '#8B5E3C', '#1C1410', '#F5EBDD') },
      ] },
    { id: 'b', nombre: 'Tostadores', resumen: 'Papel kraft, etiqueta de bolsa y carta tipo ticket.',
      tema: t('b', c('#1D1A16', '#B3402A', '#D9C6A1', '#1D1A16'), 'Fraunces', 'DM Mono', '2px'),
      paletas: [
        { nombre: 'Kraft', colores: c('#1D1A16', '#B3402A', '#D9C6A1', '#1D1A16') },
        { nombre: 'Papel gris', colores: c('#222222', '#3F6B4E', '#CFCFC4', '#222222') },
        { nombre: 'Kraft oscuro', colores: c('#1A1510', '#8C2F1C', '#B89E75', '#1A1510') },
        { nombre: 'Blanco roto', colores: c('#2B2A27', '#C5502F', '#F1EBDD', '#2B2A27') },
      ] },
    { id: 'c', nombre: 'Matutino', resumen: 'Verde bosque con pegatinas, letras enormes y color.',
      tema: t('c', c('#E9B44C', '#E4572E', '#1F3A2E', '#FFF4E0'), 'Bricolage Grotesque', 'Inter', '24px'),
      paletas: [
        { nombre: 'Bosque', colores: c('#E9B44C', '#E4572E', '#1F3A2E', '#FFF4E0') },
        { nombre: 'Azul noche', colores: c('#F2C14E', '#E4572E', '#14283D', '#FDF3E1') },
        { nombre: 'Vino', colores: c('#F0B67F', '#E8505B', '#3A1620', '#FFF1E6') },
        { nombre: 'Crema', colores: c('#E4572E', '#1F3A2E', '#FFF4E0', '#2A1E14') },
      ] },
  ],
  barberia: [
    { id: 'a', nombre: 'Black & Gold', resumen: 'Negro y dorado, letras fuertes, diagonal y cinta en movimiento.',
      tema: t('a', c('#C9A227', '#E5C65A', '#0D0D0D', '#F2F2F2'), 'Oswald', 'Inter', '2px'),
      paletas: [
        { nombre: 'Negro y oro', colores: c('#C9A227', '#E5C65A', '#0D0D0D', '#F2F2F2') },
        { nombre: 'Rojo clásico', colores: c('#C8352B', '#F0B2AC', '#111111', '#F5F5F5') },
        { nombre: 'Azul marino', colores: c('#E3B45B', '#6B8FBF', '#0F1B2D', '#EEF2F8') },
        { nombre: 'Hueso y negro', colores: c('#111111', '#8A6D3B', '#F4F0E8', '#161616') },
      ] },
    { id: 'b', nombre: 'Poste clásico', resumen: 'Poste de barbero animado y tarifario donde se arma el turno.',
      tema: t('b', c('#C1272D', '#14213D', '#F3EBDD', '#14213D'), 'Alfa Slab One', 'Inter', '6px'),
      extras: ['Barlow Condensed'],
      paletas: [
        { nombre: 'Rojo y azul', colores: c('#C1272D', '#14213D', '#F3EBDD', '#14213D') },
        { nombre: 'Verde club', colores: c('#A4262C', '#1E3A2F', '#EFE9D8', '#1E3A2F') },
        { nombre: 'Gris hierro', colores: c('#D0462B', '#23272E', '#E9E7E1', '#23272E') },
        { nombre: 'Azul real', colores: c('#1D4E89', '#0B1F3A', '#F6EFE2', '#0B1F3A') },
      ] },
    { id: 'c', nombre: 'Calle', resumen: 'Bordes gruesos, sombras duras y botones que se hunden.',
      tema: t('c', c('#FF4F1F', '#F2E94E', '#EDEBE4', '#111111'), 'Archivo Black', 'Space Mono', '0px'),
      paletas: [
        { nombre: 'Naranja y amarillo', colores: c('#FF4F1F', '#F2E94E', '#EDEBE4', '#111111') },
        { nombre: 'Rosa urbano', colores: c('#FF3D8B', '#7CF2DD', '#F0E8E4', '#111111') },
        { nombre: 'Lima', colores: c('#A3E635', '#FDE047', '#EDEBE4', '#111111') },
        { nombre: 'Azul eléctrico', colores: c('#3B5BFF', '#FFD23F', '#EEECE6', '#111111') },
      ] },
  ],
  perfumes: [
    { id: 'a', nombre: 'Marfil dorado', resumen: 'Ivory y oro, tipografía fina y aparición con desenfoque.',
      tema: t('a', c('#1F1B24', '#B08D57', '#FAF8F5', '#1F1B24'), 'Cormorant Garamond', 'Inter', '2px'),
      paletas: [
        { nombre: 'Elegante', colores: c('#1F1B24', '#B08D57', '#FAF8F5', '#1F1B24') },
        { nombre: 'Rosé', colores: c('#7A2E4A', '#D8A7B1', '#FFF7F8', '#2A1219') },
        { nombre: 'Noche', colores: c('#D4AF6A', '#8E7CC3', '#14121C', '#F1ECF7') },
        { nombre: 'Marfil', colores: c('#3D3A35', '#A89F91', '#F7F4EF', '#26231F') },
      ] },
    { id: 'b', nombre: 'Noir', resumen: 'Oscuro y burdeos, luz que sigue al cursor y notas que se revelan.',
      tema: t('b', c('#C8A46A', '#5A1424', '#0B0A0C', '#EDE6DA'), 'Bodoni Moda', 'Jost', '0px'),
      paletas: [
        { nombre: 'Noir', colores: c('#C8A46A', '#5A1424', '#0B0A0C', '#EDE6DA') },
        { nombre: 'Esmeralda', colores: c('#C9B27C', '#123B33', '#07100E', '#E8EFE9') },
        { nombre: 'Bordó', colores: c('#D8B27A', '#6A1B2D', '#12080B', '#F3E6DC') },
        { nombre: 'Medianoche', colores: c('#B9A6E8', '#2A2150', '#0A0B14', '#E9E7F5') },
      ] },
    { id: 'c', nombre: 'Laboratorio', resumen: 'Ficha técnica en monoespaciada, dibujo botánico y filtros por familia.',
      tema: t('c', c('#1E2A22', '#B5532F', '#E8ECE0', '#1E2A22'), 'Instrument Serif', 'JetBrains Mono', '12px'),
      paletas: [
        { nombre: 'Salvia', colores: c('#1E2A22', '#B5532F', '#E8ECE0', '#1E2A22') },
        { nombre: 'Arcilla', colores: c('#3A2A22', '#A8452A', '#EFE4D8', '#2F231D') },
        { nombre: 'Lavanda seca', colores: c('#2B2540', '#7A4E9A', '#E9E6EF', '#2B2540') },
        { nombre: 'Mar', colores: c('#16313A', '#C4572A', '#E1EAEA', '#16313A') },
      ] },
  ],
  salud: [
    { id: 'a', nombre: 'Turquesa', resumen: 'Bloques en turquesa, tipografía amable y cifras que cuentan.',
      tema: t('a', c('#0E7C86', '#5BC0BE', '#F6FBFB', '#12333A'), 'Poppins', 'Inter', '16px'),
      paletas: [
        { nombre: 'Turquesa', colores: c('#0E7C86', '#5BC0BE', '#F6FBFB', '#12333A') },
        { nombre: 'Azul confianza', colores: c('#2563EB', '#93C5FD', '#F6F9FF', '#13224A') },
        { nombre: 'Verde vida', colores: c('#15803D', '#86EFAC', '#F5FBF7', '#12301E') },
        { nombre: 'Lavanda', colores: c('#6D4FC2', '#C4B5F5', '#FAF8FF', '#241A44') },
      ] },
    { id: 'b', nombre: 'Cálido', resumen: 'Arcos y formas orgánicas, serifa amable y color tierra.',
      tema: t('b', c('#2F5D50', '#E0603F', '#FBF4EC', '#2A332F'), 'Fraunces', 'Figtree', '20px'),
      paletas: [
        { nombre: 'Verde y coral', colores: c('#2F5D50', '#E0603F', '#FBF4EC', '#2A332F') },
        { nombre: 'Salvia', colores: c('#3E6B57', '#D9663D', '#F3F6EF', '#26332D') },
        { nombre: 'Arcilla', colores: c('#8A4B3A', '#D98E3D', '#FBF1EA', '#3A2A24') },
        { nombre: 'Azul suave', colores: c('#2C5C84', '#E0603F', '#F2F7FB', '#1F2F3D') },
      ] },
    { id: 'c', nombre: 'Editorial + agenda', resumen: 'Marino y menta, titulares editoriales y agenda de citas a la vista.',
      tema: t('c', c('#0F1F3D', '#7AE0C3', '#FFFFFF', '#0F1F3D'), 'Newsreader', 'Inter Tight', '12px'),
      paletas: [
        { nombre: 'Marino y menta', colores: c('#0F1F3D', '#7AE0C3', '#FFFFFF', '#0F1F3D') },
        { nombre: 'Verde clínico', colores: c('#0B3B2E', '#8BE0B0', '#FFFFFF', '#0B3B2E') },
        { nombre: 'Violeta', colores: c('#2B1B5A', '#C4B5FD', '#FFFFFF', '#2B1B5A') },
        { nombre: 'Gris azulado', colores: c('#1F2937', '#93C5FD', '#FFFFFF', '#1F2937') },
      ] },
  ],
};

export const IDS_DISENO: Diseno[] = ['a', 'b', 'c'];

export const esDiseno = (v: unknown): v is Diseno => v === 'a' || v === 'b' || v === 'c';

/** El diseño del tema; los negocios anteriores a esta función no lo traen y usan el 'a' */
export const disenoDe = (t: Pick<Tema, 'diseno'> | null | undefined): Diseno => (esDiseno(t?.diseno) ? t.diseno : 'a');

export const defDiseno = (rubro: Rubro, d: Diseno): DisenoDef => DISENOS[rubro].find((x) => x.id === d) ?? DISENOS[rubro][0];

/** Clave que usan los estilos: "cafeteria-b" */
export const estiloDe = (rubro: Rubro, d: Diseno): string => `${rubro}-${d}`;

export const extrasDe = (rubro: Rubro, d: Diseno): string[] => defDiseno(rubro, d).extras ?? [];

/** Cómo pedir cada tipografía a Google Fonts (algunas solo existen en un peso o necesitan cursiva) */
const PEDIDO_FUENTE: Record<string, string> = {
  'Alfa Slab One': '',
  'Archivo Black': '',
  'Instrument Serif': 'ital@0;1',
  'Space Mono': 'wght@400;700',
  'DM Mono': 'wght@400;500',
  'JetBrains Mono': 'wght@400;500',
  Jost: 'wght@300;400;500',
  'Barlow Condensed': 'wght@500;600;700',
  'Bricolage Grotesque': 'wght@500;700;800',
  Fraunces: 'ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,800;1,9..144,400',
  'Bodoni Moda': 'ital,wght@0,400;0,600;1,400',
  Newsreader: 'ital,opsz,wght@0,6..72,400;1,6..72,400',
  'Cormorant Garamond': 'ital,wght@0,400;0,500;0,600;1,400;1,500',
  'Playfair Display': 'ital,wght@0,500;0,700;1,500',
};

export const pedidoFuente = (f: string): string => PEDIDO_FUENTE[f] ?? 'wght@400;500;600;700';
