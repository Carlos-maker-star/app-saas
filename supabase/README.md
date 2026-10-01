# Base de datos (Supabase)

## Orden de ejecución
Pegar y ejecutar en **Supabase > SQL Editor**, en este orden:

1. `01_schema.sql` – tablas
2. `02_funciones_auxiliares.sql` – `mi_tenant()`, `soy_super_admin()`
3. `03_rls.sql` – seguridad por fila y triggers de protección
4. `04_funciones_negocio.sql` – RPC del frontend
5. `05_storage.sql` – bucket `media` y sus políticas
6. `06_seed_plantillas.sql` – las 4 plantillas (cafetería, barbería, perfumes, salud)

## Crear tu usuario super admin
1. Regístrate (o créate en Authentication > Users) con tu correo.
2. Copia tu UUID y ejecuta:

```sql
insert into public.perfiles (user_id, rol)
values ('PEGA-TU-UUID-AQUI', 'super_admin')
on conflict (user_id) do update set rol = 'super_admin', tenant_id = null;
```

## RPC disponibles para el frontend
| Función | Quién | Para qué |
|---|---|---|
| `landing_publica(slug)` | público | Datos de la landing (null si suspendida/no publicada) |
| `slug_disponible(slug)` | público | Validar subdominio en el registro |
| `crear_mi_negocio(nombre, slug, rubro, whatsapp)` | cliente | Alta de negocio + landing desde plantilla |
| `publicar_landing()` | cliente | Copia borrador → publicado |
| `despublicar_landing()` | cliente | Oculta su landing |
| `admin_set_estado(tenant, estado)` | super admin | Suspender / reactivar |
| `admin_listar_clientes()` | super admin | Listado con estado y métricas |

## Reglas de seguridad
- Nunca usar la `service_role key` en el frontend; solo `anon key`.
- Un cliente no puede cambiar su `estado`, `plan`, `slug` ni `rubro` (trigger).
- Un cliente no puede escribir `publicado`/`publicada` directamente (usa `publicar_landing()`).
- Imágenes: ruta `media/<tenant_id>/archivo.webp`, máx. 3 MB.

## Prueba de aislamiento (obligatoria)
Crear 2 cuentas de prueba, cada una con su negocio, y verificar que desde la cuenta A
no se pueden leer ni modificar `items` ni `landings` de B.
