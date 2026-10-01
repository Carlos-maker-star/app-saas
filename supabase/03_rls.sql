-- =====================================================================
-- 03_rls.sql  |  Seguridad por fila (aislamiento entre clientes)
-- =====================================================================

alter table public.tenants    enable row level security;
alter table public.perfiles   enable row level security;
alter table public.plantillas enable row level security;
alter table public.landings   enable row level security;
alter table public.items      enable row level security;

-- ---------------- TENANTS ----------------
create policy "tenants_select" on public.tenants for select to authenticated
  using (id = public.mi_tenant() or public.soy_super_admin());

create policy "tenants_update" on public.tenants for update to authenticated
  using (id = public.mi_tenant() or public.soy_super_admin())
  with check (id = public.mi_tenant() or public.soy_super_admin());

create policy "tenants_admin_insert" on public.tenants for insert to authenticated
  with check (public.soy_super_admin());

create policy "tenants_admin_delete" on public.tenants for delete to authenticated
  using (public.soy_super_admin());

-- Trigger: un cliente NO puede cambiar su slug, estado ni plan
create function public.tg_proteger_tenant() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() es null al ejecutar desde el SQL Editor: se permite
  if auth.uid() is not null and not public.soy_super_admin() then
    if new.estado is distinct from old.estado
       or new.plan  is distinct from old.plan
       or new.slug  is distinct from old.slug
       or new.rubro is distinct from old.rubro then
      raise exception 'No tienes permiso para modificar estado, plan, slug o rubro';
    end if;
  end if;
  return new;
end $$;

create trigger tenants_proteger before update on public.tenants
for each row execute function public.tg_proteger_tenant();

-- ---------------- PERFILES ----------------
-- Solo lectura del propio perfil. Los inserts se hacen con crear_mi_negocio().
create policy "perfiles_select" on public.perfiles for select to authenticated
  using (user_id = auth.uid() or public.soy_super_admin());

create policy "perfiles_admin_all" on public.perfiles for all to authenticated
  using (public.soy_super_admin()) with check (public.soy_super_admin());

-- ---------------- PLANTILLAS ----------------
create policy "plantillas_select" on public.plantillas for select to authenticated
  using (activa or public.soy_super_admin());

create policy "plantillas_admin_all" on public.plantillas for all to authenticated
  using (public.soy_super_admin()) with check (public.soy_super_admin());

-- ---------------- LANDINGS ----------------
create policy "landings_select" on public.landings for select to authenticated
  using (tenant_id = public.mi_tenant() or public.soy_super_admin());

create policy "landings_update" on public.landings for update to authenticated
  using (tenant_id = public.mi_tenant() or public.soy_super_admin())
  with check (tenant_id = public.mi_tenant() or public.soy_super_admin());

create policy "landings_admin_insert" on public.landings for insert to authenticated
  with check (public.soy_super_admin());

create policy "landings_admin_delete" on public.landings for delete to authenticated
  using (public.soy_super_admin());

-- Trigger: el cliente no puede cambiar 'publicado' ni 'publicada' a mano;
-- debe usar publicar_landing() / despublicar_landing().
create function public.tg_proteger_landing() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.soy_super_admin() then
    if new.publicado is distinct from old.publicado
       or new.publicada is distinct from old.publicada
       or new.tenant_id is distinct from old.tenant_id then
      raise exception 'Usa publicar_landing() para publicar';
    end if;
  end if;
  return new;
end $$;

create trigger landings_proteger before update on public.landings
for each row execute function public.tg_proteger_landing();

-- ---------------- ITEMS ----------------
create policy "items_all" on public.items for all to authenticated
  using (tenant_id = public.mi_tenant() or public.soy_super_admin())
  with check (tenant_id = public.mi_tenant() or public.soy_super_admin());
