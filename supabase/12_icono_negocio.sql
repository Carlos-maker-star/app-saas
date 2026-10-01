-- =====================================================================
-- 12_icono_negocio.sql   (ejecutar una vez, después del 11)
-- Icono de la pestaña (favicon) que puede subir cada negocio.
-- Si no sube uno, la web genera uno según su rubro y sus colores.
-- =====================================================================

alter table public.tenants add column if not exists icono_url text;

create or replace function public.landing_publica(p_slug text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'nombre',    t.nombre,
    'rubro',     t.rubro,
    'whatsapp',  t.whatsapp,
    'logo_url',  t.logo_url,
    'icono_url', t.icono_url,
    'email',     t.email,
    'telefono',  t.telefono,
    'direccion', t.direccion,
    'redes',     t.redes,
    'tema',      coalesce(l.tema_publicado, l.tema),
    'contenido', l.publicado,
    'seo',       coalesce(l.seo_publicado, l.seo),
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
