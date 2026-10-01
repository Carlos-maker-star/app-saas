-- =====================================================================
-- 02_funciones_auxiliares.sql  |  Helpers para RLS
-- security definer evita recursión infinita en las políticas
-- =====================================================================

create function public.mi_tenant() returns uuid
language sql stable security definer set search_path = public as $$
  select tenant_id from public.perfiles where user_id = auth.uid()
$$;

create function public.soy_super_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.perfiles
    where user_id = auth.uid() and rol = 'super_admin'
  )
$$;

revoke all on function public.mi_tenant() from public;
revoke all on function public.soy_super_admin() from public;
grant execute on function public.mi_tenant() to authenticated;
grant execute on function public.soy_super_admin() to authenticated;
