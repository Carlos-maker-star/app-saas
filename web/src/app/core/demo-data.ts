import { defDiseno } from './disenos';
import { Diseno, Item, LandingPublica, Redes, Rubro, Seccion } from './models';

/** Datos de ejemplo para ver las plantillas sin Supabase (/demo/:rubro). */

const redes: Redes = {
  instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/',
  tiktok: 'https://tiktok.com/',
};

let n = 0;
const item = (tipo: Item['tipo'], categoria: string | null, nombre: string, descripcion: string | null,
              precio: number | null, extra: Record<string, string> = {}): Item => ({
  id: `demo-${++n}`, tipo, categoria, nombre, descripcion, precio, imagen_url: null, extra, orden: n, visible: true,
});

const sec = (id: string, tipo: Seccion['tipo'], datos: Seccion['datos']): Seccion => ({ id, tipo, visible: true, datos });

const horarios = (dias: { dia: string; hora: string }[]) => ({ titulo: 'Horarios', dias });

function base(rubro: Rubro): LandingPublica {
  n = 0;
  const base = { whatsapp: '51900000000', logo_url: null, email: 'hola@ejemplo.com', telefono: '900 000 000', redes, seo: {} };

  switch (rubro) {
    case 'cafeteria':
      return { ...base, rubro, nombre: 'Café Aroma', direccion: 'Av. Larco 123, Miraflores', tema: defDiseno('cafeteria', 'a').tema,
        contenido: [
          sec('hero', 'hero', { etiqueta: 'Tostado artesanal · Lima', titulo: 'Tu café de cada día, hecho con calma.', subtitulo: 'Granos de altura, postres horneados cada mañana y una mesa esperándote.', imagen: null, rating: '4.9 ★ · 320 reseñas', boton: { texto: 'Hacer pedido por WhatsApp', mensaje: 'Hola, quisiera hacer un pedido.' } }),
          sec('carta', 'catalogo', { titulo: 'Nuestra carta', subtitulo: 'Toca un plato para pedirlo por WhatsApp', tipo_item: 'producto', moneda: 'S/', boton_item: 'Pedir', mensaje_item: 'Hola, quisiera pedir: {nombre}' }),
          sec('galeria', 'galeria', { titulo: 'Nuestro espacio', imagenes: [] }),
          sec('horarios', 'horarios', horarios([{ dia: 'Lun – Vie', hora: '7:00 – 21:00' }, { dia: 'Sáb – Dom', hora: '8:00 – 22:00' }])),
          sec('contacto', 'contacto', { titulo: '¿Reservamos tu mesa?', texto: 'Escríbenos y te atendemos de inmediato.', boton: 'Reservar por WhatsApp', mensaje: 'Hola, quisiera reservar una mesa.' }),
        ],
        items: [
          item('producto', 'Cafés', 'Espresso doble', 'Grano de Chanchamayo, notas a cacao.', 8),
          item('producto', 'Cafés', 'Latte de vainilla', 'Leche cremosa y vainilla natural.', 12),
          item('producto', 'Cafés', 'Cold brew', 'Infusionado 18 horas, servido con hielo.', 13),
          item('producto', 'Postres', 'Cheesecake de maracuyá', 'Base de galleta, hecho cada mañana.', 14),
          item('producto', 'Postres', 'Croissant de almendras', 'Hojaldre mantecoso, crema de almendra.', 9),
          item('producto', 'Postres', 'Brownie tibio', 'Con helado de crema.', 11),
        ] };

    case 'barberia':
      return { ...base, rubro, nombre: 'Barbería Don Filo', direccion: 'Calle Mercaderes 456, Arequipa', tema: defDiseno('barberia', 'a').tema,
        contenido: [
          sec('hero', 'hero', { etiqueta: 'Desde 2015 · Arequipa', titulo: 'Estilo y precisión', subtitulo: 'Cortes clásicos, barba y afeitado a navaja. Reserva tu turno y evita la fila.', imagen: null, boton: { texto: 'Agendar cita por WhatsApp', mensaje: 'Hola, quisiera agendar una cita.' } }),
          sec('servicios', 'servicios', { titulo: 'Servicios y precios', moneda: 'S/', boton_item: 'Reservar', mensaje_item: 'Hola, quisiera reservar: {nombre}' }),
          sec('equipo', 'equipo', { titulo: 'Nuestros barberos' }),
          sec('galeria', 'galeria', { titulo: 'Nuestros trabajos', imagenes: [] }),
          sec('horarios', 'horarios', horarios([{ dia: 'Lun – Sáb', hora: '10:00 – 20:00' }, { dia: 'Domingo', hora: 'Cerrado' }])),
          sec('contacto', 'contacto', { titulo: 'Reserva tu turno', texto: 'Elige tu horario por WhatsApp.', boton: 'Agendar ahora', mensaje: 'Hola, quisiera agendar una cita.' }),
        ],
        items: [
          item('servicio', null, 'Corte clásico', 'Tijera o máquina, con acabado a navaja. 40 min.', 25),
          item('servicio', null, 'Arreglo de barba', 'Perfilado, toalla caliente y aceites. 30 min.', 18),
          item('servicio', null, 'Corte + barba', 'El combo completo. 60 min.', 38),
          item('servicio', null, 'Corte infantil', 'Menores de 12 años. 30 min.', 20),
          item('miembro', null, 'Filo Ramírez', 'Maestro barbero', null),
          item('miembro', null, 'Diego Paz', 'Fade y diseño', null),
          item('miembro', null, 'Marco Silva', 'Barba clásica', null),
          item('miembro', null, 'Luis Cano', 'Corte infantil', null),
        ] };

    case 'perfumes':
      return { ...base, rubro, nombre: 'Essence', direccion: null, tema: defDiseno('perfumes', 'a').tema,
        contenido: [
          sec('hero', 'hero', { etiqueta: 'Perfumes originales', titulo: 'Fragancias que dejan huella', subtitulo: '', imagen: null, boton: { texto: 'Consultar por WhatsApp', mensaje: 'Hola, quisiera información sobre sus perfumes.' } }),
          sec('catalogo', 'catalogo', { titulo: 'Catálogo', tipo_item: 'producto', moneda: 'S/', filtros: ['ella', 'el', 'unisex'], boton_item: 'Consultar', mensaje_item: 'Hola, me interesa el perfume: {nombre}' }),
          sec('beneficios', 'beneficios', { items: [{ titulo: '100% originales', texto: 'Garantía de autenticidad en cada frasco.' }, { titulo: 'Envíos a todo el país', texto: 'Coordina tu entrega por WhatsApp.' }, { titulo: 'Asesoría personal', texto: 'Te ayudamos a elegir tu fragancia ideal.' }] }),
          sec('contacto', 'contacto', { titulo: '¿Buscas una fragancia?', texto: 'Cuéntanos qué te gusta y te recomendamos.', boton: 'Pedir recomendación', mensaje: 'Hola, quisiera una recomendación de perfume.' }),
        ],
        items: [
          item('producto', null, 'Coco Mademoiselle', null, 480, { marca: 'Chanel', genero: 'ella', familia: 'floral', ml: '100 ml', notas: 'Salida · Naranja; Corazón · Rosa, jazmín; Fondo · Pachulí' }),
          item('producto', null, 'Sauvage EDT', null, 420, { marca: 'Dior', genero: 'el', familia: 'fresco', familia2: 'amaderado', ml: '100 ml', notas: 'Salida · Bergamota; Corazón · Pimienta; Fondo · Ámbar' }),
          item('producto', null, 'Oud Wood', null, 790, { marca: 'Tom Ford', genero: 'unisex', familia: 'amaderado', ml: '50 ml', notas: 'Salida · Cardamomo; Corazón · Oud; Fondo · Sándalo' }),
          item('producto', null, 'Libre', null, 450, { marca: 'YSL', genero: 'ella', familia: 'floral', familia2: 'amaderado', ml: '90 ml', notas: 'Salida · Mandarina; Corazón · Lavanda; Fondo · Vainilla' }),
          item('producto', null, '1 Million', null, 380, { marca: 'Paco Rabanne', genero: 'el', familia: 'amaderado', ml: '100 ml', notas: 'Salida · Pomelo; Corazón · Canela; Fondo · Cuero' }),
          item('producto', null, 'Aventus', null, 1150, { marca: 'Creed', genero: 'unisex', familia: 'fresco', familia2: 'amaderado', ml: '100 ml', notas: 'Salida · Piña; Corazón · Abedul; Fondo · Almizcle' }),
          item('producto', null, 'La Vie Est Belle', null, 430, { marca: 'Lancôme', genero: 'ella', familia: 'floral', ml: '75 ml', notas: 'Salida · Pera; Corazón · Iris; Fondo · Praliné' }),
          item('producto', null, 'Acqua di Giò', null, 360, { marca: 'Armani', genero: 'el', familia: 'fresco', ml: '100 ml', notas: 'Salida · Cítricos; Corazón · Romero; Fondo · Cedro' }),
        ] };

    case 'salud':
      return { ...base, rubro, nombre: 'Clínica Vida', direccion: 'Jr. Pizarro 789, Trujillo', tema: defDiseno('salud', 'a').tema,
        contenido: [
          sec('hero', 'hero', { etiqueta: 'Consultorio médico · Trujillo', titulo: 'Tu salud, nuestra prioridad.', subtitulo: 'Atención profesional y cercana. Agenda tu cita en un minuto por WhatsApp.', imagen: null, stat: { valor: 12, prefijo: '+', texto: 'años de experiencia' }, boton: { texto: 'Agendar cita por WhatsApp', mensaje: 'Hola, quisiera agendar una cita.' } }),
          sec('servicios', 'servicios', { titulo: 'Especialidades y servicios', boton_item: 'Consultar', mensaje_item: 'Hola, quisiera consultar sobre: {nombre}' }),
          sec('equipo', 'equipo', { titulo: 'Nuestro equipo' }),
          sec('testimonios', 'testimonios', { titulo: 'Lo que dicen nuestros pacientes', items: [{ texto: 'Me atendieron puntual y con mucha amabilidad.', nombre: 'Carmen R.' }, { texto: 'Agendé por WhatsApp en minutos. Muy práctico.', nombre: 'Julio M.' }, { texto: 'Mi hijo ya no le teme al doctor. Gracias.', nombre: 'Patricia L.' }] }),
          sec('faq', 'faq', { titulo: 'Preguntas frecuentes', items: [{ pregunta: '¿Cómo agendo una cita?', respuesta: 'Escríbenos por WhatsApp y coordinamos tu horario.' }, { pregunta: '¿Aceptan seguros?', respuesta: 'Consúltanos tu seguro y te confirmamos cobertura.' }, { pregunta: '¿Atienden emergencias?', respuesta: 'Atendemos citas programadas. Para emergencias acude al hospital más cercano.' }] }),
          sec('horarios', 'horarios', horarios([{ dia: 'Lun – Vie', hora: '8:00 – 18:00' }, { dia: 'Sábado', hora: '8:00 – 13:00' }])),
          sec('contacto', 'contacto', { titulo: 'Agenda tu cita hoy', texto: 'Estamos para ayudarte.', boton: 'Escribir por WhatsApp', mensaje: 'Hola, quisiera agendar una cita.' }),
        ],
        items: [
          item('servicio', null, 'Cardiología', 'Chequeo cardiológico y electrocardiograma.', null),
          item('servicio', null, 'Pediatría', 'Control de niño sano y vacunas.', null),
          item('servicio', null, 'Odontología', 'Limpieza, ortodoncia y blanqueamiento.', null),
          item('miembro', null, 'Dra. Ana Torres', 'Cardióloga', null),
          item('miembro', null, 'Dr. Luis Vega', 'Pediatra', null),
          item('miembro', null, 'Dra. Rosa Quispe', 'Odontóloga', null),
          item('miembro', null, 'Dr. Jorge Paz', 'Medicina general', null),
        ] };
  }
}

export const RUBROS: Rubro[] = ['cafeteria', 'barberia', 'perfumes', 'salud'];

/** Cambios de contenido de cada diseño (textos de ejemplo pensados para su composición) */
function ajustar(d: LandingPublica, diseno: Diseno): LandingPublica {
  const hero = d.contenido.find((x) => x.tipo === 'hero')?.datos ?? {};
  const antesDelFinal = (nueva: Seccion) => {
    const fin = d.contenido.findIndex((x) => x.tipo === 'contacto');
    d.contenido.splice(fin < 0 ? d.contenido.length : fin, 0, nueva);
  };
  switch (d.rubro + '-' + diseno) {
    case 'cafeteria-b':
      Object.assign(hero, {
        etiqueta: 'Lote Nº 042 · tueste de esta semana', titulo: 'Tostado ayer. En tu taza hoy.',
        subtitulo: 'Tostamos en lotes pequeños cada lunes. Pide por WhatsApp y retira sin cola.',
        ficha_titulo: 'Chanchamayo Honey Caturra', ficha_subtitulo: 'Café en grano · 250 g',
        ficha: [{ clave: 'Altura', valor: '1 800 msnm' }, { clave: 'Proceso', valor: 'Honey' }, { clave: 'Notas', valor: 'Cacao · Naranja' }, { clave: 'Tostado', valor: 'Lun 12' }],
      });
      antesDelFinal(sec('pasos', 'beneficios', { items: [
        { titulo: 'Elige', texto: 'Mira la carta o el grano de la semana y decide.' },
        { titulo: 'Escríbenos', texto: 'Un mensaje por WhatsApp con tu pedido y la hora de recojo.' },
        { titulo: 'Recoge', texto: 'Entra, di tu nombre y llévate tu pedido caliente.' }] }));
      break;
    case 'cafeteria-c':
      Object.assign(hero, { etiqueta: 'Yanahuara · desde las 7', titulo: 'Buen café. Buen día.', subtitulo: 'Café de especialidad, pan de masa madre y desayunos que te ponen de buen humor.',
        cinta: 'Café de especialidad, Pan de masa madre, Desayunos todo el día' });
      break;
    case 'barberia-b':
      Object.assign(hero, { etiqueta: 'Desde 1998 · Arequipa', titulo: 'Corte clásico. Navaja al ras.',
        subtitulo: 'Barbería de las de antes: toalla caliente, navaja y conversación. Marca tus servicios y reserva por WhatsApp.' });
      break;
    case 'barberia-c':
      Object.assign(hero, { etiqueta: 'Sin cita previa los martes', titulo: 'Corte. Barba. Estilo.',
        subtitulo: 'Barbería de barrio, sin postureo. Cortes de verdad, precios claros y turnos por WhatsApp.' });
      break;
    case 'perfumes-b':
      Object.assign(hero, { etiqueta: 'Eau de parfum · Edición nocturna', titulo: 'Noche', subtitulo: 'Una fragancia para cuando se apagan las luces. Frasco de 100 ml y decant de 10 ml.' });
      d.contenido.find((x) => x.tipo === 'beneficios')!.datos = { items: [
        { titulo: 'Pimienta negra', texto: 'Chispa seca y picante que se desvanece a los quince minutos.' },
        { titulo: 'Oud y cuero', texto: 'El centro oscuro y cálido. Dura horas sobre la piel.' },
        { titulo: 'Vainilla ahumada', texto: 'La estela que queda en la bufanda al día siguiente.' }] };
      break;
    case 'perfumes-c':
      Object.assign(hero, { etiqueta: 'N.º 07 · Colección otoño', titulo: 'Aromas con nombre propio.', subtitulo: 'Cada fragancia llega con su ficha: familia, notas y concentración. Elige con datos y consulta por WhatsApp.' });
      d.contenido.find((x) => x.tipo === 'beneficios')!.datos = { items: [
        { titulo: '100 %', texto: 'Frascos originales' }, { titulo: '10 ml', texto: 'Decants disponibles' }, { titulo: '24 h', texto: 'Entrega en Lima' }] };
      break;
    case 'salud-b':
      Object.assign(hero, { etiqueta: 'Atendemos hoy hasta las 8 pm', titulo: 'Cuidamos de ti y de los tuyos.', rating: '4.9 / 5 · +800 reseñas',
        subtitulo: 'Un consultorio pequeño con trato de familia y el tiempo que mereces en cada consulta.' });
      break;
    case 'salud-c':
      Object.assign(hero, { etiqueta: 'Medicina familiar · Trujillo', titulo: 'Atención médica que se siente cercana.', horas: '09:00, 10:30, 12:00, 15:00, 16:30, 18:00',
        subtitulo: 'Elige especialidad, día y hora en menos de un minuto y confirmamos por WhatsApp.' });
      break;
  }
  return d;
}

/** Datos de ejemplo de un rubro con el diseño elegido ('a' por defecto) */
export function datosDemo(rubro: Rubro, diseno: Diseno = 'a'): LandingPublica {
  const d = base(rubro);
  d.tema = structuredClone(defDiseno(rubro, diseno).tema);
  return ajustar(d, diseno);
}
