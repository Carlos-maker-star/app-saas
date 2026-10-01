-- =====================================================================
-- 10_arreglos_publicacion.sql   (ejecutar una vez, después del 09)
--
-- 1) Publicar/despublicar fallaban: el trigger que impide al cliente escribir lo publicado
--    "a mano" también bloqueaba a las propias funciones publicar_landing() y
--    despublicar_landing(), porque dentro de ellas auth.uid() sigue siendo el del cliente.
--    Ahora esas funciones levantan una señal local a la transacción que el trigger respeta.
--    (Un cliente no puede levantarla: set_config no está expuesto en la API.)
--
-- 2) Las plantillas traían una sección "ubicacion" que la web no dibuja (la dirección ya se
--    muestra en "Horarios y ubicación"). Se quita de plantillas y de las landings existentes.
-- =====================================================================

-- 1) ---------------------------------------------------------------
create or replace function public.tg_proteger_landing() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null
     and not public.soy_super_admin()
     and coalesce(current_setting('app.publicando', true), '') <> 'on' then
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

create or replace function public.publicar_landing() returns void
language plpgsql security definer set search_path = public as $$
declare v_tenant uuid := public.mi_tenant();
begin
  if v_tenant is null then raise exception 'No tienes un negocio'; end if;

  perform set_config('app.publicando', 'on', true);   -- solo dura esta transacción
  update public.landings
     set publicado = borrador, tema_publicado = tema, seo_publicado = seo,
         publicada = true, publicada_en = now()
   where tenant_id = v_tenant;
end $$;

create or replace function public.despublicar_landing() returns void
language plpgsql security definer set search_path = public as $$
declare v_tenant uuid := public.mi_tenant();
begin
  if v_tenant is null then raise exception 'No tienes un negocio'; end if;

  perform set_config('app.publicando', 'on', true);
  update public.landings set publicada = false where tenant_id = v_tenant;
end $$;

revoke all on function public.publicar_landing() from public;
revoke all on function public.despublicar_landing() from public;
grant execute on function public.publicar_landing() to authenticated;
grant execute on function public.despublicar_landing() to authenticated;

-- 2) ---------------------------------------------------------------
create or replace function public.sin_ubicacion(p jsonb) returns jsonb
language sql immutable as $$
  select coalesce(jsonb_agg(s.valor order by s.pos), '[]'::jsonb)
  from jsonb_array_elements(p) with ordinality as s(valor, pos)
  where s.valor->>'tipo' <> 'ubicacion'
$$;

update public.plantillas set secciones = public.sin_ubicacion(secciones);

-- (el trigger de landings no se dispara aquí: se ejecuta desde el SQL Editor, auth.uid() es null)
update public.landings
   set borrador  = public.sin_ubicacion(borrador),
       publicado = case when publicado is null then null else public.sin_ubicacion(publicado) end;

drop function public.sin_ubicacion(jsonb);
