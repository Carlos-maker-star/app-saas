-- =====================================================================
-- 07_redes_y_marca.sql  |  Redes sociales, logo y datos de contacto editables
-- Ejecutar después del 06. Es seguro ejecutarlo una sola vez.
-- =====================================================================

alter table public.tenants
  add column if not exists redes     jsonb not null default '{}'::jsonb,  -- {instagram, facebook, tiktok, youtube, x, linkedin, web}
  add column if not exists logo_url  text,
  add column if not exists email     text,
  add column if not exists telefono  text,
  add column if not exists direccion text;

alter table public.tenants
  add constraint tenants_redes_objeto check (jsonb_typeof(redes) = 'object');

-- La landing pública ahora también devuelve marca y redes
create or replace function public.landing_publica(p_slug text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'nombre',    t.nombre,
    'rubro',     t.rubro,
    'whatsapp',  t.whatsapp,
    'logo_url',  t.logo_url,
    'email',     t.email,
    'telefono',  t.telefono,
    'direccion', t.direccion,
    'redes',     t.redes,
    'tema',      l.tema,
    'contenido', l.publicado,
    'seo',       l.seo,
    'items', (
      select coalesce(jsonb_agg(to_jsonb(i) - 'tenant_id' order by i.orden), '[]'::jsonb)
      from public.items i
      where i.tenant_id = t.id and i.visible
    )
  )
  from public.tenants t
  join public.landings l on l.tenant_id = t.id
  where t.slug = lower(p_slug)
    and t.estado = 'activo'
    and l.publicada = true
$$;

grant execute on function public.landing_publica(text) to anon, authenticated;
