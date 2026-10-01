-- =====================================================================
-- 09_publicacion_completa.sql
-- Hasta ahora solo el contenido (secciones) tenía borrador/publicado; el tema (colores,
-- fuentes) y el SEO se leían del borrador, o sea, salían en vivo al guardar.
-- Ahora "Publicar" copia también el tema y el SEO. Ejecutar una vez, después del 08.
--
-- Siguen siendo "en vivo" (no versionados): datos del negocio (nombre, WhatsApp, redes,
-- dirección, logo) y los productos/servicios/equipo (tabla items).
-- =====================================================================

alter table public.landings
  add column if not exists tema_publicado jsonb,
  add column if not exists seo_publicado  jsonb;

-- Lo que ya estaba publicado queda igual
update public.landings
   set tema_publicado = tema, seo_publicado = seo
 where publicada and tema_publicado is null;

create or replace function public.publicar_landing() returns void
language plpgsql security definer set search_path = public as $$
declare v_tenant uuid := public.mi_tenant();
begin
  if v_tenant is null then raise exception 'No tienes un negocio'; end if;

  update public.landings
     set publicado = borrador, tema_publicado = tema, seo_publicado = seo,
         publicada = true, publicada_en = now()
   where tenant_id = v_tenant;
end $$;

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

-- Un cliente no puede escribir directamente lo publicado
create or replace function public.tg_proteger_landing() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.soy_super_admin() then
    if new.publicado       is distinct from old.publicado
       or new.tema_publicado is distinct from old.tema_publicado
       or new.seo_publicado  is distinct from old.seo_publicado
       or new.publicada      is distinct from old.publicada
       or new.tenant_id      is distinct from old.tenant_id then
      raise exception 'Usa publicar_landing() para publicar';
    end if;
  end if;
  return new;
end $$;
