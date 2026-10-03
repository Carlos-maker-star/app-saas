import { buildWhatsAppUrl } from './whatsapp';
import { MARCA } from './marca';

/** Enlace del botón «Ayuda» del panel: WhatsApp si hay número configurado, si no el correo. Lleva el nombre del negocio. */
export function urlSoporte(negocio?: string | null, email?: string | null): string {
  const quien = negocio ? ` de «${negocio}»` : '';
  const mensaje = `Hola, necesito ayuda con mi página en ${MARCA.nombre}${quien}.`;
  const { whatsapp, email: correo } = MARCA.soporte;
  if (whatsapp) return buildWhatsAppUrl(whatsapp, mensaje + (email ? ` Mi cuenta: ${email}.` : ''));
  return `mailto:${correo}?subject=${encodeURIComponent(`Ayuda con ${MARCA.nombre}`)}&body=${encodeURIComponent(mensaje)}`;
}
