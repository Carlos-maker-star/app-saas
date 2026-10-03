import { MARCA } from './marca';

export interface BloqueLegal { titulo: string; parrafos?: string[]; lista?: string[]; }
export interface DocLegal { titulo: string; resumen: string; bloques: BloqueLegal[]; }

const N = MARCA.nombre;
const T = MARCA.legal.titular;
const C = MARCA.soporte.email;

/**
 * BORRADOR: texto general para arrancar. Antes de cobrar a clientes, que lo revise un abogado de tu país
 * (ley aplicable, datos del titular, plazos). Si lo cambias, actualiza `MARCA.legal.version`.
 */
export const LEGAL: Record<'terminos' | 'privacidad', DocLegal> = {
  terminos: {
    titulo: 'Términos de uso',
    resumen: `Las reglas para usar ${N}. Léelas antes de crear tu cuenta.`,
    bloques: [
      { titulo: '1. Quiénes somos y qué ofrecemos', parrafos: [
        `${N} es un servicio operado por ${T} («nosotros») que permite a un negocio crear una página web de presentación (landing page), editarla desde un panel y publicarla con un enlace propio. El contacto con los clientes del negocio se hace por WhatsApp. ${N} no procesa pagos ni ventas.`,
        'Al crear una cuenta aceptas estos términos y la Política de privacidad. Si no estás de acuerdo, no uses el servicio.',
      ] },
      { titulo: '2. Tu cuenta', lista: [
        'Debes ser mayor de edad y tener capacidad para representar al negocio que registras.',
        'Los datos que das al registrarte deben ser verdaderos y mantenerse al día.',
        'Eres responsable de tu contraseña y de lo que se haga con tu cuenta. Avísanos si sospechas un uso no autorizado.',
        'Cada cuenta es para un negocio. No puedes revender ni ceder el acceso sin nuestro permiso.',
      ] },
      { titulo: '3. Tu contenido', parrafos: [
        'Todo lo que publicas (textos, fotos, logos, precios, datos de contacto) sigue siendo tuyo. Nos das permiso para almacenarlo, mostrarlo en tu página y hacer copias técnicas necesarias para que el servicio funcione.',
        'Eres el único responsable de ese contenido. Declaras que tienes derecho a usarlo y que es exacto, en particular precios, horarios y datos de contacto.',
      ] },
      { titulo: '4. Usos no permitidos', parrafos: ['No puedes usar el servicio para publicar o promover:'], lista: [
        'Contenido ilegal, engañoso, fraudulento o que suplante a otra persona o empresa.',
        'Material que infrinja derechos de autor, marcas u otros derechos de terceros.',
        'Contenido sexual explícito, violento, discriminatorio o que incite al odio.',
        'Productos o servicios prohibidos por la ley donde operas.',
        'Software malicioso, o intentos de acceder a datos de otros clientes o de dañar el servicio.',
      ] },
      { titulo: '5. Suspensión y cierre', parrafos: [
        'Podemos suspender o despublicar una página, o cerrar una cuenta, si incumples estos términos, si recibimos una denuncia fundada o si lo exige la ley. Cuando sea razonable, te avisaremos antes y te daremos la oportunidad de corregirlo.',
        'Puedes dejar de usar el servicio cuando quieras y pedirnos que borremos tu cuenta (ver Política de privacidad).',
      ] },
      { titulo: '6. Precio y pagos', parrafos: [
        `El precio, la forma y la fecha de pago se acuerdan directamente con el administrador de ${N}, por WhatsApp (+${MARCA.soporte.whatsapp.replace(/^51/, '51 ')}) o por correo (${C}). El pago no se hace dentro de la plataforma y no se cobra nada sin tu acuerdo previo.`,
        'Antes de que pagues te confirmaremos por escrito qué incluye el servicio, cuánto cuesta y cada cuánto se paga. Si hay reembolsos o plazos de cancelación, también se te dirán en ese acuerdo. Podemos cambiar los precios avisándote con anticipación razonable, y el cambio solo aplica si lo aceptas.',
        'Si no cumples con el pago acordado, podemos despublicar tu página después de avisarte. Tus datos se conservan según la Política de privacidad.',
      ] },
      { titulo: '7. Disponibilidad del servicio', parrafos: [
        `Trabajamos para que ${N} esté siempre disponible, pero se ofrece «tal cual»: puede haber interrupciones por mantenimiento, fallos o causas ajenas (por ejemplo, de proveedores de internet o de alojamiento). No garantizamos resultados concretos, como un número de visitas o de clientes.`,
        'Te recomendamos conservar tus propias copias de tus textos y fotos.',
      ] },
      { titulo: '8. Responsabilidad', parrafos: [
        'En la medida que permita la ley, no respondemos por pérdidas indirectas ni por lucro cesante derivados del uso o la imposibilidad de uso del servicio, ni por lo que los visitantes o terceros hagan con la información publicada en tu página. Nada de lo aquí dicho limita responsabilidades que la ley no permita limitar.',
      ] },
      { titulo: '9. Cambios en estos términos', parrafos: [
        'Podemos actualizar estos términos. Publicaremos la nueva versión en esta página con su fecha y, si el cambio es importante, te avisaremos por correo o dentro del panel. Si sigues usando el servicio después, entendemos que aceptas la versión nueva.',
      ] },
      { titulo: '10. Ley aplicable y contacto', parrafos: [
        `Estos términos se rigen por las leyes del país donde ${T} tiene su domicilio, y las diferencias se resolverán ante sus tribunales, sin perjuicio de los derechos que la ley te reconozca como consumidor.`,
        `Para cualquier duda o reclamo, escríbenos a ${C}.`,
      ] },
    ],
  },

  privacidad: {
    titulo: 'Política de privacidad',
    resumen: 'Qué datos guardamos, para qué los usamos y cómo puedes controlarlos.',
    bloques: [
      { titulo: '1. Responsable', parrafos: [
        `${T} es el responsable del tratamiento de los datos de ${N}. Contacto: ${C}.`,
      ] },
      { titulo: '2. Qué datos guardamos', lista: [
        'De tu cuenta: correo electrónico y contraseña (la contraseña se guarda cifrada; nosotros no podemos verla).',
        'De tu negocio: nombre, rubro, WhatsApp, teléfono, correo, dirección, redes, logo, fotos, textos, productos y servicios que decidas cargar.',
        'De tu aceptación de estos textos: la versión y la fecha en que los aceptaste.',
        'Datos técnicos mínimos para que el servicio funcione y sea seguro (por ejemplo, registros de acceso del servidor).',
      ], parrafos: [
        `Las páginas que publicas no tienen formularios ni recogen datos de quienes las visitan: el botón de contacto solo abre WhatsApp. Lo que el visitante escriba allí se rige por las condiciones de WhatsApp, no por ${N}.`,
      ] },
      { titulo: '3. Para qué los usamos', lista: [
        'Crear y mantener tu cuenta y mostrar tu página con el contenido que publicaste.',
        'Enviarte correos del servicio: códigos de verificación, restablecer contraseña y avisos importantes.',
        'Dar soporte, mantener la seguridad y cumplir obligaciones legales.',
      ], parrafos: ['No vendemos tus datos ni los usamos para publicidad de terceros.'] },
      { titulo: '4. Con quién los compartimos', parrafos: [
        'Usamos proveedores que procesan datos en nuestro nombre y solo para prestar el servicio:',
      ], lista: [
        'Supabase: base de datos, inicio de sesión y almacenamiento de imágenes.',
        'Vercel: alojamiento y entrega de las páginas.',
        'Un servicio de correo (hoy Gmail/SMTP) para enviar los mensajes de verificación.',
      ] },
      { titulo: '5. Qué es público', parrafos: [
        'Lo que publiques en tu landing (nombre del negocio, textos, fotos, WhatsApp, teléfono, correo, dirección y redes) es visible para cualquiera con el enlace y puede aparecer en buscadores como Google. Publica solo lo que quieres que sea público. Puedes despublicar tu página en cualquier momento desde el panel.',
      ] },
      { titulo: '6. Cuánto tiempo los guardamos', parrafos: [
        'Mientras tu cuenta esté activa. Si pides borrarla, eliminamos tus datos y tus archivos en un plazo razonable, salvo lo que debamos conservar por ley. Las copias de seguridad pueden tardar un tiempo adicional en depurarse.',
      ] },
      { titulo: '7. Tus derechos', parrafos: [
        `Puedes pedirnos acceder a tus datos, corregirlos, borrarlos, oponerte a su uso o llevártelos. Escríbenos a ${C} desde el correo de tu cuenta y responderemos en un plazo razonable. Gran parte de tus datos ya puedes editarlos tú mismo desde el panel.`,
      ] },
      { titulo: '8. Cookies y almacenamiento local', parrafos: [
        'Usamos únicamente almacenamiento técnico necesario: mantener tu sesión iniciada y recordar tu preferencia de modo claro u oscuro. No usamos cookies de publicidad ni de seguimiento.',
      ] },
      { titulo: '9. Seguridad', parrafos: [
        'Aplicamos medidas razonables: conexión cifrada (HTTPS), contraseñas cifradas y reglas de acceso para que cada negocio solo pueda ver y editar lo suyo. Ningún sistema es infalible; si ocurre un incidente que te afecte, te lo comunicaremos.',
      ] },
      { titulo: '10. Cambios', parrafos: [
        'Si cambiamos esta política publicaremos la nueva versión aquí, con su fecha, y te avisaremos si el cambio es importante.',
      ] },
    ],
  },
};
