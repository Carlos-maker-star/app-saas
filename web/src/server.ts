import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { Request } from 'express';
import { join } from 'node:path';
import { env } from './app/core/env';
import { slugDeHost } from './app/core/seo';
import { supabase } from './app/core/supabase.client';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();
app.disable('x-powered-by');

/** Páginas con sesión: Google no debe entrar a ellas */
const RUTAS_PRIVADAS = ['/panel', '/editor', '/admin', '/login', '/registro', '/crear-negocio', '/vista-previa', '/demo/'];

const esLocal = (host: string) => /^(localhost|[\w-]+\.localhost)(:\d+)?$/.test(host);
const hostDe = (req: Request) => req.headers.host ?? 'localhost';
/** "https://host": fuera de localhost siempre https */
const origenDe = (req: Request) => `${esLocal(hostDe(req)) ? req.protocol : 'https'}://${hostDe(req)}`;
const xml = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);

/* ---------- Seguridad ---------- */
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // el editor muestra la vista previa en un iframe del mismo sitio
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  if (!esLocal(hostDe(req))) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

/* ---------- robots.txt ---------- */
app.get('/robots.txt', (req, res) => {
  const lineas = ['User-agent: *'];
  if (slugDeHost(hostDe(req), env.dominioBase)) lineas.push('Allow: /', ...RUTAS_PRIVADAS.map((r) => `Disallow: ${r}`));
  else lineas.push(...RUTAS_PRIVADAS.map((r) => `Disallow: ${r}`));
  lineas.push('', `Sitemap: ${origenDe(req)}/sitemap.xml`);
  res.type('text/plain').set('Cache-Control', 'public, max-age=3600').send(lineas.join('\n') + '\n');
});

/* ---------- sitemap.xml ---------- */
app.get('/sitemap.xml', async (req, res) => {
  const slug = slugDeHost(hostDe(req), env.dominioBase);
  const { data } = supabase
    ? await supabase.rpc('sitemap_landings', { p_slug: slug })
    : { data: null };
  const filas = (data ?? []) as { slug: string; actualizado: string }[];
  if (slug && !filas.length) { res.status(404).type('text/plain').send('No encontrado'); return; }

  const o = origenDe(req);
  const urls = filas.map((f) => {
    const loc = slug ? `${o}/` : env.dominioBase ? `https://${f.slug}.${env.dominioBase}/` : `${o}/n/${f.slug}`;
    return `  <url><loc>${xml(loc)}</loc><lastmod>${new Date(f.actualizado).toISOString()}</lastmod></url>`;
  });
  res.type('application/xml').set('Cache-Control', 'public, max-age=300')
    .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
});

/** Archivos estáticos (JS, CSS, imágenes con hash) */
app.use(express.static(browserDistFolder, { maxAge: '1y', index: false, redirect: false }));

/** El resto lo dibuja Angular en el servidor */
app.use(async (req, res, next) => {
  try {
    const respuesta = await angularApp.handle(req);
    if (!respuesta) { next(); return; }

    // Caché corta en el CDN para páginas públicas (los cambios aparecen en ~1 minuto); errores nunca se guardan
    const headers = new Headers(respuesta.headers);
    const publica = req.path === '/' || req.path.startsWith('/n/');
    if (respuesta.status >= 400) headers.set('Cache-Control', 'no-store');
    else if (publica) headers.set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
    headers.set('Vary', 'Host');

    await writeResponseToNodeResponse(
      new Response(respuesta.body, { status: respuesta.status, statusText: respuesta.statusText, headers }), res);
  } catch (e) {
    next(e);
  }
});

/**
 * Arranca el servidor si este módulo es el punto de entrada (o corre bajo PM2).
 * Escucha en el puerto de la variable PORT (4000 por omisión).
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) throw error;
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/** Manejador usado por el CLI de Angular (servidor de desarrollo y compilación) */
export const reqHandler = createNodeRequestHandler(app);
