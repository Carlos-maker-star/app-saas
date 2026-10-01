# Publicar en Vercel — guía paso a paso

Qué se despliega: la carpeta `web/` (Angular con renderizado en servidor). La base de datos y el login
siguen en Supabase; no hay que mover nada.

Los archivos de Vercel ya están en `web/`:
- `web/vercel.json` — comando de compilación, carpeta de salida y reglas.
- `web/api/index.mjs` — la función que atiende las páginas (usa el servidor de `src/server.ts`).
- `web/package.json` → `engines.node = 24.x` (Angular 22 exige Node 22.22+ / 24.15+).

---

## Fase 1 · Subir el proyecto a GitHub (una sola vez)

1. Crea una cuenta en https://github.com y un repositorio **privado** vacío (sin README), por ejemplo `vitrina`.
2. En una terminal:

```bash
cd C:\project-carlos\app-saas
git init
git add .
git commit -m "Primera versión"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/vitrina.git
git push -u origin main
```

> Seguro de subir: el único dato sensible en el código es la clave `sb_publishable_…` de Supabase, que es
> pública por diseño. Nunca subas la clave `service_role` (no está en el proyecto).

## Fase 2 · Crear el proyecto en Vercel

1. https://vercel.com → **Add New… → Project** → importa el repositorio.
2. **Root Directory:** `web` (importante: el proyecto Angular está en esa subcarpeta).
3. **Framework Preset:** `Other`. El resto (build, carpeta de salida) ya viene en `vercel.json`.
4. Si pide versión de Node: **24.x**.
5. **Deploy.** Tarda unos minutos.
6. Al terminar tendrás una dirección como `vitrina-xxxx.vercel.app`. Pruébala:
   - `/demo/cafeteria` → plantilla de demostración
   - `/n/tu-slug` → tu landing real
   - `/robots.txt` y `/sitemap.xml`

Cada `git push` a `main` vuelve a desplegar solo.

> Plan: con el plan gratuito (Hobby) puedes probar, pero su uso es **no comercial**. Para lanzar la
> plataforma a clientes necesitas el plan **Pro**.

## Fase 3 · Avisar a Supabase de tu dirección

En Supabase → **Authentication → URL Configuration**:
- **Site URL:** la dirección de producción (`https://vitrina-xxxx.vercel.app`, luego tu dominio).
- **Redirect URLs:** añade `https://vitrina-xxxx.vercel.app/**` (y luego `https://tuapp.com/**`).

Sin esto, el enlace del correo de confirmación puede llevar a una dirección equivocada.

## Opción sin comprar dominio: usar el de Vercel (`algo.vercel.app`)

Funciona sin cambiar nada del código (`dominioBase` queda vacío). Cada landing se abre en
`tu-proyecto.vercel.app/n/slug`. No hay subdominios por cliente (los comodines exigen dominio propio) y todas
las landings comparten tu dirección; el SEO funciona igual (título, datos estructurados, sitemap con `/n/slug`).
El uso comercial sigue requiriendo el plan Pro de Vercel.

- Pon un nombre fácil al proyecto al importarlo: decide la dirección.
- Search Console: registra **«Prefijo de URL»** (`https://tu-proyecto.vercel.app`), no «Dominio», y verifica con un
  archivo HTML colocado en `web/public/`.
- Si más adelante compras un dominio, pasa a la Fase 4: nada de lo anterior se pierde.

## Fase 4 · Dominio propio y subdominios por cliente (opcional)

1. Compra un dominio (ejemplo `tuapp.com`). Lo más simple: comprarlo en Vercel (pestaña **Domains**).
   Si lo compras en otro sitio, cambia sus *nameservers* a `ns1.vercel-dns.com` y `ns2.vercel-dns.com`
   (los dominios comodín lo exigen para generar los certificados).
2. En el proyecto → **Settings → Domains**: añade `tuapp.com` y luego `*.tuapp.com`.
3. En el código, dos cambios y un `git push`:
   - `web/src/app/core/env.ts` → `dominioBase: 'tuapp.com'`
   - `web/angular.json` → en `security.allowedHosts` añade `"tuapp.com"` y `"*.tuapp.com"`
4. Espera a que el DNS se propague (puede tardar hasta 24–48 h).
5. Resultado: `carwis.tuapp.com` muestra la landing de Carwis; `tuapp.com/login` es el acceso.

> Pon `dominioBase` solo cuando el dominio ya esté conectado: con ese valor el panel muestra los enlaces
> como `https://cliente.tuapp.com`.

## Fase 5 · Google Search Console

1. https://search.google.com/search-console → **Añadir propiedad → Dominio** → `tuapp.com`.
2. Verifica con el registro DNS (con Vercel DNS se añade en un clic).
3. **Sitemaps** → envía `https://tuapp.com/sitemap.xml` (lista todas las landings publicadas).
4. Para ver si Google ya leyó una landing: **Inspección de URLs** → pega su dirección.

## Antes de abrir a clientes (lista de control)

- [ ] Scripts SQL `01` a `11` ejecutados en Supabase.
- [ ] Supabase: **Confirm email** activado y envío de correos propio (SMTP: Resend, Brevo…), no el de prueba.
- [ ] Supabase: CAPTCHA y límites de intentos activados en Authentication.
- [ ] Nombre definitivo de la plataforma en `web/src/app/core/marca.ts` (hoy es «Vitrina»).
- [ ] Términos de uso y política de privacidad.
- [ ] Plan Pro de Vercel.

## Si algo falla

| Síntoma | Causa probable |
|---|---|
| Error 400 al abrir la web | El dominio no está en `security.allowedHosts` (`angular.json`) |
| La compilación falla por versión de Node | Falta `engines.node` o la versión elegida en Vercel no es 24.x |
| Todo da 404 | El **Root Directory** no es `web` |
| `/n/slug` dice «no disponible» | La landing no está publicada o el negocio está suspendido |
| El correo de confirmación no llega o abre otra dirección | Fase 3 sin hacer, o límite de correos de Supabase |
