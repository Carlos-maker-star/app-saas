# Web (Angular 22 + Tailwind 4 + Supabase)

## Cómo correrlo
```bash
npm install
npm start          # http://localhost:4200
npm test           # pruebas unitarias
npm run build
```

## Rutas
| Ruta | Qué muestra |
|---|---|
| `/` | Índice de demos (o la landing si hay subdominio / `?s=slug`) |
| `/demo/:rubro` | Plantilla con datos de ejemplo (`cafeteria`, `barberia`, `perfumes`, `salud`), sin Supabase |
| `/demo/:rubro/:diseno` | Lo mismo con uno de sus 3 diseños (`a`, `b`, `c`), p. ej. `/demo/salud/c` |

## Diseños por rubro
Cada rubro tiene **3 diseños** (`core/disenos.ts`): su paleta, tipografías y bordes viven allí y el diseño elegido se guarda en `tema.diseno` (sin él, es el `a`). El cliente lo cambia en el editor, pestaña **Diseño**.
- La clave de estilo es `rubro-diseno` (`cafeteria-b`): `LandingStore.estilo()`, atributo `data-estilo` de la landing.
- La portada y las secciones principales de cada diseño están en `sections/disenos/`; el resto de secciones se adapta con CSS (`src/styles/<rubro>.css`).
- Movimiento compartido (curvas, entradas escalonadas) en `src/styles/base.css`.
- Para añadir un diseño: preset en `disenos.ts`, componentes en `sections/disenos/`, CSS en `src/styles/`, y su caso en `hero.ts` / `catalogo.ts` / `servicios.ts`.
| `/n/:slug` | Landing real de un negocio (función SQL `landing_publica`) |

## Conectar Supabase
Editar `src/app/core/env.ts` con la **Project URL** y la **anon key** (nunca la `service_role`).
Con eso, `/n/<slug>` carga la landing publicada de ese negocio.

## Estructura
```
src/app/
  core/        modelos, store de la landing, cliente Supabase, tema (variables CSS), WhatsApp, seguridad de URLs, demos
  sections/    un componente por bloque (hero, catalogo, servicios, equipo, galeria, horarios, contacto, ...)
  shared/      directivas de animación (aparición al scroll, contador) e iconos de redes
  pages/       inicio y landing (recorre el JSON de secciones y pinta cada bloque)
```

## Cómo funciona
- La landing es un **JSON de secciones** (`contenido`); cada `tipo` tiene su componente.
- Los **colores y fuentes** salen de `tema` y se aplican como variables CSS (`estiloTema`), así cada cliente puede personalizarlos.
- Cada **rubro** cambia la composición (hero, carta, servicios) y el estilo de animación.
- Toda URL que viene de la base pasa por `urlSegura` (solo https).

## SEO y renderizado en servidor (SSR)
- `/`, `/n/:slug` y `/demo/:rubro` se generan **en el servidor** en cada petición (`src/app/app.routes.server.ts`); login, panel, editor y admin se dibujan en el navegador.
- Cada landing publicada sale con título, descripción, `canonical`, Open Graph, Twitter Card y JSON-LD de negocio local (`core/seo.ts`, `core/seo.service.ts`). Demos, errores y páginas no disponibles llevan `noindex`.
- Una landing inexistente o suspendida responde **404**; un fallo de Supabase, **503** (no se guarda en caché).
- `src/server.ts` (Express) sirve `/robots.txt`, `/sitemap.xml` (requiere `supabase/11_sitemap.sql`), cabeceras de seguridad y caché corta (`s-maxage=30`, sin servir copias viejas) para las páginas públicas: publicar o suspender tarda hasta 30 s en verse.
- Los datos viajan del servidor al navegador con `TransferState` (no se piden dos veces).
- Cómo se reconoce el negocio: subdominio (`cliente.<dominioBase>`), `?s=cliente` o `/n/cliente`. `dominioBase` está en `core/env.ts`.

```bash
npm run build
node dist/web/server/server.mjs   # http://localhost:4000
```

### Para producción
1. Poner `dominioBase` en `core/env.ts` (por ejemplo `tuapp.com`).
2. Añadir el dominio y `*.tuapp.com` a `security.allowedHosts` en `angular.json`.
3. Hosting con Node (SSR) y dominio comodín `*.tuapp.com` con certificado.
4. Registrar el dominio en Google Search Console y enviar `sitemap.xml`.
