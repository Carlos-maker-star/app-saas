-- =====================================================================
-- 08_ajuste_tema_barberia.sql
-- En el tema, "primario" es el color de botones y acentos de marca.
-- En la barbería el primario debe ser el dorado (antes estaba en negro).
-- Ejecutar una vez, después del 07.
-- =====================================================================

update public.plantillas
set tema = jsonb_set(jsonb_set(tema, '{colores,primario}', '"#C9A227"'), '{colores,acento}', '"#E5C65A"')
where rubro = 'barberia';

-- Landings ya creadas desde esa plantilla que aún tengan el tema original
update public.landings l
set tema = p.tema
from public.plantillas p
where p.id = l.plantilla_id
  and p.rubro = 'barberia'
  and l.tema #>> '{colores,primario}' = '#111111';
