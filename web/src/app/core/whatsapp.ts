/** https://wa.me/<solo dígitos>?text=<mensaje codificado> */
export function buildWhatsAppUrl(numero: string | null | undefined, mensaje: string, nombre?: string): string {
  const texto = mensaje.replaceAll('{nombre}', nombre ?? '');
  const digitos = (numero ?? '').replace(/\D/g, '');
  return `https://wa.me/${digitos}?text=${encodeURIComponent(texto)}`;
}
