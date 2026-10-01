-- =====================================================================
-- 04_funciones_negocio.sql  |  RPC que usa el frontend
-- =====================================================================

-- ---------------------------------------------------------------------
-- Landing pública (la usa el visitante, sin sesión)
-- Devuelve null si el tenant está suspendido o la landing no está publicada
-- ---------------------------------------------------------------------
create function public.landing_publica(p_slug text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'nombre',    t.nombre,
    'rubro',     t.rubro,
    'whatsapp',  t.whatsapp,
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

-- ---------------------------------------------------------------------
-- Verificar si un slug está libre (para el formulario de registro)
-- ---------------------------------------------------------------------
create function public.slug_disponible(p_slug text) returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.tenants where slug = lower(p_slug))
$$;

grant execute on function public.slug_disponible(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Registro de cliente nuevo: crea tenant + perfil + landing desde plantilla
-- Se llama justo después del signUp
-- ---------------------------------------------------------------------
create function public.crear_mi_negocio(
  p_nombre text, p_slug text, p_rubro text, p_whatsapp text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_tenant uuid;
  v_pl     public.plantillas;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión';
  end if;
  if exists (select 1 from public.perfiles where user_id = auth.uid()) then
    raise exception 'Esta cuenta ya tiene un negocio';
  end if;

  insert into public.tenants (nombre, slug, rubro, whatsapp)
  values (trim(p_nombre), lower(trim(p_slug)), p_rubro,
          nullif(regexp_replace(coalesce(p_whatsapp,''), '\D', '', 'g'), ''))
  returning id into v_tenant;

  insert into public.perfiles (user_id, tenant_id) values (auth.uid(), v_tenant);

  select * into v_pl from public.plantillas
  where rubro = p_rubro and activa order by creado_en limit 1;

  if v_pl.id is null then
    raise exception 'No hay plantilla activa para el rubro %', p_rubro;
  end if;

  insert into public.landings (tenant_id, plantilla_id, tema, borrador)
  values (v_tenant, v_pl.id, v_pl.tema, v_pl.secciones);

  return v_tenant;
end $$;

revoke all on function public.crear_mi_negocio(text,text,text,text) from public;
grant execute on function public.crear_mi_negocio(text,text,text,text) to authenticated;

-- ---------------------------------------------------------------------
-- Publicar: copia borrador -> publicado
-- ---------------------------------------------------------------------
create function public.publicar_landing() returns void
language plpgsql security definer set search_path = public as $$
declare v_tenant uuid := public.mi_tenant();
begin
  if v_tenant is null then raise exception 'No tienes un negocio'; end if;

  update public.landings
     set publicado = borrador, publicada = true, publicada_en = now()
   where tenant_id = v_tenant;
end $$;

-- Despublicar: el cliente oculta su propia landing
create function public.despublicar_landing() returns void
language plpgsql security definer set search_path = public as $$
declare v_tenant uuid := public.mi_tenant();
begin
  if v_tenant is null then raise exception 'No tienes un negocio'; end if;

  update public.landings set publicada = false where tenant_id = v_tenant;
end $$;

revoke all on function public.publicar_landing() from public;
revoke all on function public.despublicar_landing() from public;
grant execute on function public.publicar_landing() to authenticated;
grant execute on function public.despublicar_landing() to authenticated;

-- ---------------------------------------------------------------------
-- Super admin: suspender / reactivar un cliente
-- ---------------------------------------------------------------------
create function public.admin_set_estado(p_tenant uuid, p_estado text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.soy_super_admin() then
    raise exception 'Solo el super admin puede hacer esto';
  end if;
  if p_estado not in ('activo','suspendido') then
    raise exception 'Estado inválido';
  end if;
  update public.tenants set estado = p_estado where id = p_tenant;
end $$;

revoke all on function public.admin_set_estado(uuid,text) from public;
grant execute on function public.admin_set_estado(uuid,text) to authenticated;

-- ---------------------------------------------------------------------
-- Super admin: listado de clientes con métricas básicas
-- ---------------------------------------------------------------------
create function public.admin_listar_clientes() returns table (
  id uuid, nombre text, slug text, rubro text, whatsapp text,
  estado text, plan text, publicada boolean, creado_en timestamptz,
  ultima_edicion timestamptz
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.soy_super_admin() then
    raise exception 'Solo el super admin puede hacer esto';
  end if;
  return query
    select t.id, t.nombre, t.slug, t.rubro, t.whatsapp, t.estado, t.plan,
           coalesce(l.publicada, false), t.creado_en, l.actualizado_en
    from public.tenants t
    left join public.landings l on l.tenant_id = t.id
    order by t.creado_en desc;
end $$;

revoke all on function public.admin_listar_clientes() from public;
grant execute on function public.admin_listar_clientes() to authenticated;
