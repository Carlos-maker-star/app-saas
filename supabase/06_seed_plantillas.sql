-- =====================================================================
-- 06_seed_plantillas.sql  |  Plantillas iniciales (4 rubros)
-- Cada sección: { id, tipo, visible, datos }
-- Los textos son de ejemplo: el cliente los reemplaza desde su panel.
-- =====================================================================

insert into public.plantillas (rubro, nombre, tema, secciones) values

-- ---------------------------------------------------------------------
-- CAFETERÍA
-- ---------------------------------------------------------------------
('cafeteria', 'Café Cálido',
 '{"colores":{"primario":"#6F4E37","acento":"#C8A27A","fondo":"#FBF6EF","texto":"#2B1D14"},
   "fuentes":{"titulos":"Playfair Display","texto":"Inter"},"radio":"12px"}',
 '[
  {"id":"hero","tipo":"hero","visible":true,"datos":{"titulo":"Tu café de cada día","subtitulo":"Granos selectos, postres artesanales y el mejor ambiente.","imagen":null,"boton":{"texto":"Hacer pedido por WhatsApp","mensaje":"Hola, quisiera hacer un pedido."}}},
  {"id":"carta","tipo":"catalogo","visible":true,"datos":{"titulo":"Nuestra carta","tipo_item":"producto","boton_item":"Pedir","mensaje_item":"Hola, quisiera pedir: {nombre}"}},
  {"id":"galeria","tipo":"galeria","visible":true,"datos":{"titulo":"Nuestro espacio","imagenes":[]}},
  {"id":"horarios","tipo":"horarios","visible":true,"datos":{"titulo":"Horarios","dias":[{"dia":"Lun - Vie","hora":"7:00 - 21:00"},{"dia":"Sáb - Dom","hora":"8:00 - 22:00"}]}},
  {"id":"contacto","tipo":"contacto","visible":true,"datos":{"titulo":"Reserva tu mesa","texto":"Escríbenos y te atendemos de inmediato.","mensaje":"Hola, quisiera reservar una mesa."}}
 ]'),

-- ---------------------------------------------------------------------
-- BARBERÍA
-- ---------------------------------------------------------------------
('barberia', 'Barber Clásico',
 '{"colores":{"primario":"#111111","acento":"#C9A227","fondo":"#0D0D0D","texto":"#F2F2F2"},
   "fuentes":{"titulos":"Oswald","texto":"Inter"},"radio":"4px"}',
 '[
  {"id":"hero","tipo":"hero","visible":true,"datos":{"titulo":"Estilo y precisión","subtitulo":"Cortes, barba y cuidado personal con los mejores barberos.","imagen":null,"boton":{"texto":"Agendar cita","mensaje":"Hola, quisiera agendar una cita."}}},
  {"id":"servicios","tipo":"servicios","visible":true,"datos":{"titulo":"Servicios y precios","tipo_item":"servicio","boton_item":"Reservar","mensaje_item":"Hola, quisiera reservar: {nombre}"}},
  {"id":"equipo","tipo":"equipo","visible":true,"datos":{"titulo":"Nuestros barberos","tipo_item":"miembro"}},
  {"id":"galeria","tipo":"galeria","visible":true,"datos":{"titulo":"Nuestros trabajos","imagenes":[]}},
  {"id":"horarios","tipo":"horarios","visible":true,"datos":{"titulo":"Horarios","dias":[{"dia":"Lun - Sáb","hora":"10:00 - 20:00"},{"dia":"Domingo","hora":"Cerrado"}]}},
  {"id":"contacto","tipo":"contacto","visible":true,"datos":{"titulo":"Reserva tu turno","texto":"Escríbenos por WhatsApp y elige tu horario.","mensaje":"Hola, quisiera agendar una cita."}}
 ]'),

-- ---------------------------------------------------------------------
-- PERFUMES
-- ---------------------------------------------------------------------
('perfumes', 'Perfumería Elegante',
 '{"colores":{"primario":"#1F1B24","acento":"#B08D57","fondo":"#FAF8F5","texto":"#1F1B24"},
   "fuentes":{"titulos":"Cormorant Garamond","texto":"Inter"},"radio":"2px"}',
 '[
  {"id":"hero","tipo":"hero","visible":true,"datos":{"titulo":"Fragancias que dejan huella","subtitulo":"Perfumes originales de las mejores marcas.","imagen":null,"boton":{"texto":"Consultar por WhatsApp","mensaje":"Hola, quisiera información sobre sus perfumes."}}},
  {"id":"destacados","tipo":"catalogo","visible":true,"datos":{"titulo":"Catálogo","tipo_item":"producto","filtros":["marca","genero"],"boton_item":"Consultar","mensaje_item":"Hola, me interesa el perfume: {nombre}"}},
  {"id":"beneficios","tipo":"beneficios","visible":true,"datos":{"titulo":"Por qué elegirnos","items":[{"titulo":"100% originales","texto":"Garantía de autenticidad."},{"titulo":"Envíos","texto":"Coordina tu entrega por WhatsApp."},{"titulo":"Asesoría","texto":"Te ayudamos a elegir tu fragancia."}]}},
  {"id":"testimonios","tipo":"testimonios","visible":true,"datos":{"titulo":"Opiniones","items":[]}},
  {"id":"contacto","tipo":"contacto","visible":true,"datos":{"titulo":"¿Buscas una fragancia?","texto":"Cuéntanos qué te gusta y te recomendamos.","mensaje":"Hola, quisiera una recomendación de perfume."}}
 ]'),

-- ---------------------------------------------------------------------
-- SALUD
-- ---------------------------------------------------------------------
('salud', 'Salud Confiable',
 '{"colores":{"primario":"#0E7C86","acento":"#5BC0BE","fondo":"#F6FBFB","texto":"#12333A"},
   "fuentes":{"titulos":"Poppins","texto":"Inter"},"radio":"16px"}',
 '[
  {"id":"hero","tipo":"hero","visible":true,"datos":{"titulo":"Tu salud, nuestra prioridad","subtitulo":"Atención profesional, cercana y de confianza.","imagen":null,"boton":{"texto":"Agendar cita","mensaje":"Hola, quisiera agendar una cita."}}},
  {"id":"servicios","tipo":"servicios","visible":true,"datos":{"titulo":"Especialidades y servicios","tipo_item":"servicio","boton_item":"Consultar","mensaje_item":"Hola, quisiera consultar sobre: {nombre}"}},
  {"id":"equipo","tipo":"equipo","visible":true,"datos":{"titulo":"Nuestro equipo","tipo_item":"miembro"}},
  {"id":"testimonios","tipo":"testimonios","visible":true,"datos":{"titulo":"Lo que dicen nuestros pacientes","items":[]}},
  {"id":"faq","tipo":"faq","visible":true,"datos":{"titulo":"Preguntas frecuentes","items":[{"pregunta":"¿Cómo agendo una cita?","respuesta":"Escríbenos por WhatsApp y coordinamos tu horario."}]}},
  {"id":"horarios","tipo":"horarios","visible":true,"datos":{"titulo":"Horarios de atención","dias":[{"dia":"Lun - Vie","hora":"8:00 - 18:00"},{"dia":"Sábado","hora":"8:00 - 13:00"}]}},
  {"id":"contacto","tipo":"contacto","visible":true,"datos":{"titulo":"Agenda tu cita","texto":"Estamos para ayudarte.","mensaje":"Hola, quisiera agendar una cita."}}
 ]');
