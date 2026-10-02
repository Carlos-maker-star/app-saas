import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Qué se genera en el servidor (lo que ve Google) y qué solo en el navegador.
 * Las páginas con sesión (login, panel, editor, admin) no tienen nada que indexar: se dibujan en el cliente.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Server },
  { path: 'n/:slug', renderMode: RenderMode.Server },
  { path: 'demo/:rubro', renderMode: RenderMode.Server },
  { path: 'demo/:rubro/:diseno', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Client },
];
