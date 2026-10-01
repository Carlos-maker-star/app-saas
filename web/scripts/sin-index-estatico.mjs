// Después de compilar: quita dist/web/browser/index.csr.html.
//
// En Vercel, todo lo que hay en la carpeta de salida se sirve como archivo estático ANTES de pasar la
// petición al servidor de Angular. Vercel servía "/" desde index.csr.html (la versión vacía, sin
// contenido) y la portada o la landing de un subdominio salían sin renderizar en el servidor.
// El servidor de Angular lleva su propia copia de ese HTML (dist/web/server/assets-chunks), así que
// no lo necesita aquí.
import { rmSync } from 'node:fs';

rmSync(new URL('../dist/web/browser/index.csr.html', import.meta.url), { force: true });
console.log('index.csr.html quitado de dist/web/browser (lo atiende el servidor de Angular)');
