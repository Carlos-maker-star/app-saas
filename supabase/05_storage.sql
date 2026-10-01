-- =====================================================================
-- 05_storage.sql  |  Imágenes por cliente
-- Ruta de archivos:  media/<tenant_id>/<archivo>
-- =====================================================================

-- Bucket público (lectura abierta, escritura restringida por políticas)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 3145728,
        array['image/webp','image/jpeg','image/png','image/svg+xml'])
on conflict (id) do update
  set public = true,
      file_size_limit = 3145728,
      allowed_mime_types = array['image/webp','image/jpeg','image/png','image/svg+xml'];

create policy "media_insert" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'media'
    and ( (storage.foldername(name))[1] = public.mi_tenant()::text
          or public.soy_super_admin() )
  );

create policy "media_update" on storage.objects for update to authenticated
  using (
    bucket_id = 'media'
    and ( (storage.foldername(name))[1] = public.mi_tenant()::text
          or public.soy_super_admin() )
  );

create policy "media_delete" on storage.objects for delete to authenticated
  using (
    bucket_id = 'media'
    and ( (storage.foldername(name))[1] = public.mi_tenant()::text
          or public.soy_super_admin() )
  );
