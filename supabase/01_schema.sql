-- =====================================================================
-- 01_schema.sql  |  Tablas base del SaaS multi-tenant
-- Ejecutar primero en Supabase > SQL Editor
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- TENANTS: un registro por cliente (negocio)
-- ---------------------------------------------------------------------
create table public.tenants (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  slug       text not null unique
             check (slug ~ '^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])$'
                    and slug not in ('www','app','admin','api','panel','login','registro','mail')),
  rubro      text not null check (rubro in ('cafeteria','barberia','perfumes','salud')),
  whatsapp   text,                                   -- solo dígitos con código de país, ej: 51987654321
  estado     text not null default 'activo' check (estado in ('activo','suspendido')),
  plan       text not null default 'gratis',         -- para uso futuro (cobros)
  creado_en  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- PERFILES: enlaza auth.users con su tenant y su rol
-- El super_admin no necesita tenant_id
-- ---------------------------------------------------------------------
create table public.perfiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  tenant_id  uuid references public.tenants(id) on delete cascade,
  rol        text not null default 'cliente' check (rol in ('cliente','super_admin')),
  creado_en  timestamptz not null default now(),
  check (rol = 'super_admin' or tenant_id is not null)
);

create index perfiles_tenant_idx on public.perfiles (tenant_id);

-- ---------------------------------------------------------------------
-- PLANTILLAS: diseños base por rubro (las administra el super_admin)
-- ---------------------------------------------------------------------
create table public.plantillas (
  id         uuid primary key default gen_random_uuid(),
  rubro      text not null check (rubro in ('cafeteria','barberia','perfumes','salud')),
  nombre     text not null,
  tema       jsonb not null,        -- colores, tipografías, radios
  secciones  jsonb not null,        -- arreglo de bloques por defecto
  activa     boolean not null default true,
  creado_en  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- LANDINGS: la página de cada tenant
--   borrador  = lo que edita el cliente
--   publicado = lo que ve el público (se copia al publicar)
-- ---------------------------------------------------------------------
create table public.landings (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null unique references public.tenants(id) on delete cascade,
  plantilla_id   uuid references public.plantillas(id) on delete set null,
  tema           jsonb not null,
  borrador       jsonb not null,
  publicado      jsonb,
  seo            jsonb not null default '{}'::jsonb,   -- {titulo, descripcion, imagen}
  publicada      boolean not null default false,
  publicada_en   timestamptz,
  actualizado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ITEMS: productos de carta/catálogo, servicios y miembros del equipo
-- ---------------------------------------------------------------------
create table public.items (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  tipo         text not null check (tipo in ('producto','servicio','miembro')),
  categoria    text,
  nombre       text not null,
  descripcion  text,
  precio       numeric(10,2) check (precio is null or precio >= 0),
  imagen_url   text,
  extra        jsonb not null default '{}'::jsonb,   -- marca, género, cargo, etc.
  orden        int not null default 0,
  visible      boolean not null default true,
  creado_en    timestamptz not null default now()
);

create index items_tenant_idx on public.items (tenant_id, tipo, orden);

-- ---------------------------------------------------------------------
-- Trigger: actualizar fecha de última edición de la landing
-- ---------------------------------------------------------------------
create function public.tg_touch_landing() returns trigger
language plpgsql as $$
begin
  new.actualizado_en = now();
  return new;
end $$;

create trigger landings_touch before update on public.landings
for each row execute function public.tg_touch_landing();
