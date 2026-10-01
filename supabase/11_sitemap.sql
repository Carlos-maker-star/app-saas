-- =====================================================================
-- 11_sitemap.sql   (ejecutar una vez, después del 10)
-- Lista pública de landings visibles, para generar sitemap.xml.
-- Solo devuelve slug y fecha: nada de contenido ni datos del negocio.
-- Con p_slug devuelve solo esa landing (para el sitemap de su subdominio).
-- =====================================================================

create or replace function public.sitemap_landings(p_slug text default null)
returns table (slug text, actualizado timestamptz)
language sql stable security definer set search_path = public as $$
  select t.slug, coalesce(l.publicada_en, l.actualizado_en)
  from public.tenants t
  join public.landings l on l.tenant_id = t.id
  where t.estado = 'activo'
    and l.publicada
    and (p_slug is null or t.slug = lower(p_slug))
  order by 2 desc
  limit 5000
$$;

grant execute on function public.sitemap_landings(text) to anon, authenticated;
