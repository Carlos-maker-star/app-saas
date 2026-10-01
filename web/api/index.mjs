// Punto de entrada de Vercel: toda petición que no sea un archivo estático llega aquí
// y la atiende el servidor de Angular (el mismo Express de src/server.ts).
export default async function handler(req, res) {
  const { reqHandler } = await import('../dist/web/server/server.mjs');
  return reqHandler(req, res);
}
