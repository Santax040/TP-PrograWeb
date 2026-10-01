-- Contenido inicial de la revista, migrado desde src/lib/data.js.
-- Nombres de artistas, lugares y fiestas son inventados.

insert into public.categorias (slug, nombre, orden) values
  ('fiestas', 'Fiestas', 1),
  ('musica', 'Música', 2),
  ('quilombo', 'Quilombo', 3),
  ('entrevistas', 'Entrevistas', 4);

insert into public.artistas (slug, nombre, genero, bio) values
  ('la-maquina-de-humo', 'La Máquina de Humo', 'Post-punk', 'Cuarteto que arrancó tocando en un sótano de Chacarita y terminó llenando salas sin firmar con nadie.'),
  ('nena-tornado', 'Nena Tornado', 'Electrónica', 'Productora y DJ. Sus sets mezclan cumbia procesada con techno de madrugada.'),
  ('el-club-del-ruido', 'El Club del Ruido', 'Noise rock', 'Dos guitarras, una batería y una política estricta de no dar entrevistas.'),
  ('dj-perejil', 'DJ Perejil', 'House', 'Residente de las fiestas de sótano desde 2019. Especialista en cerrar a las siete de la mañana.'),
  ('coro-de-vecinos', 'Coro de Vecinos', 'Indie', 'Proyecto de siete personas que se conocieron reclamando por el ruido en un edificio de Almagro.');

insert into public.articulos
  (slug, titulo, bajada, cuerpo, categoria, firma, fecha, minutos_lectura, destacado, premium, portada, estado)
values
  ('cronica-de-una-fiesta-que-no-termino', 'Crónica de una fiesta que no terminó',
   'Entramos a las dos de la mañana a una fábrica reciclada en Barracas. Salimos cuando ya había sol y panaderías abiertas.',
   array['La dirección llegó por mensaje tres horas antes. Sin nombre, sin flyer, apenas una esquina y un horario. Así funcionan las fiestas que importan: el que sabe, sabe.', 'Adentro había unas cuatrocientas personas y un sistema de sonido que claramente había costado más que el alquiler del lugar. Nadie filmaba. Esa era la regla y se cumplía sola.', 'A las cuatro entró Nena Tornado y el clima cambió. Empezó lento, casi molestando, y recién a la media hora soltó lo que todos estaban esperando.', 'A las siete, cuando abrieron las puertas, afuera estaba la panadería de la esquina levantando la persiana. Nadie se quería ir.']::text[],
   'fiestas', 'Redacción', '2026-09-20', 6, true, false, 'from-fuchsia-600 via-purple-700 to-indigo-900', 'publicada'),
  ('la-maquina-de-humo-entrevista', 'La Máquina de Humo: «No queremos que nos entiendan»',
   'Hablamos con la banda que llenó tres noches seguidas sin sello discográfico ni prensa.',
   array['Nos citaron en la sala de ensayo, un primer piso sin ventanas donde hace calor incluso en invierno. Llegaron tarde los cuatro, por separado.', '«Nos ofrecieron firmar dos veces», cuenta la bajista. «Las dos veces la charla terminó cuando preguntaron si podíamos hacer los temas más cortos».', 'El disco nuevo dura cincuenta y un minutos y tiene seis canciones. La más corta es de cuatro. Ninguna tiene estribillo en el sentido tradicional.', '«La gente que tiene que llegar, llega», dicen. Por ahora les viene funcionando.']::text[],
   'entrevistas', 'Redacción', '2026-09-18', 9, true, true, 'from-amber-500 via-orange-600 to-red-800', 'publicada'),
  ('guia-de-sotanos', 'Guía de sótanos: dónde se toca lo que no llega a la radio',
   'Seis lugares chicos, mal ventilados y con la mejor programación de la ciudad.',
   array['La escena no pasa por los estadios. Pasa por lugares de ciento veinte personas donde el escenario está a la misma altura que el público.', 'Todos los que listamos abren al menos tres noches por semana y cobran entradas que salen menos que dos cervezas en el centro.', 'Regla general: si tiene cartel luminoso en la puerta, probablemente no sea el lugar que estás buscando.']::text[],
   'musica', 'Redacción', '2026-09-15', 7, false, false, 'from-emerald-500 via-teal-700 to-slate-900', 'publicada'),
  ('el-negocio-de-las-entradas', 'El negocio de las entradas: quién se queda con tu plata',
   'Pagás una entrada de treinta mil pesos. Te contamos cuánto llega realmente a la banda.',
   array['Entre el cargo por servicio, la comisión de la plataforma y el alquiler de la sala, el número que llega a los músicos sorprende a cualquiera.', 'Hicimos el ejercicio con tres fechas reales de salas medianas. En ninguna la banda se quedó con más de un tercio.', 'Hay alternativas. Algunas funcionan y otras son marketing.']::text[],
   'quilombo', 'Redacción', '2026-09-12', 11, false, true, 'from-rose-500 via-pink-700 to-purple-900', 'publicada'),
  ('diez-discos-del-ano', 'Diez discos que te perdiste este año',
   'Ninguno llegó a las listas grandes. Todos merecían estar.',
   array['Hicimos la lista sin mirar números de reproducciones, que es la única manera de que una lista así sirva para algo.', 'Están ordenados por fecha de salida, no por preferencia. Discutir el orden es parte de la gracia.']::text[],
   'musica', 'Redacción', '2026-09-08', 8, false, false, 'from-sky-500 via-blue-700 to-indigo-900', 'publicada'),
  ('la-noche-despues-de-las-restricciones', 'La noche, después de las restricciones',
   'Tres años de horarios recortados cambiaron para siempre a qué hora sale la gente.',
   array['Antes se entraba a las dos. Ahora hay fiestas que arrancan a las diez de la noche y terminan a las cuatro.', 'Los lugares se adaptaron. El público, en parte, también. Pero no todos están contentos.', '«Perdimos la madrugada», resume el encargado de una sala de Palermo. «Ganamos otra cosa, pero perdimos la madrugada».']::text[],
   'quilombo', 'Redacción', '2026-09-02', 5, false, false, 'from-violet-500 via-indigo-700 to-slate-900', 'publicada');

insert into public.articulo_artistas (articulo_id, artista_id)
select ar.id, at.id
from (values
  ('cronica-de-una-fiesta-que-no-termino', 'nena-tornado'),
  ('cronica-de-una-fiesta-que-no-termino', 'dj-perejil'),
  ('la-maquina-de-humo-entrevista', 'la-maquina-de-humo'),
  ('guia-de-sotanos', 'el-club-del-ruido'),
  ('guia-de-sotanos', 'coro-de-vecinos'),
  ('diez-discos-del-ano', 'coro-de-vecinos'),
  ('diez-discos-del-ano', 'nena-tornado')
) as v (articulo, artista)
join public.articulos ar on ar.slug = v.articulo
join public.artistas at on at.slug = v.artista;

insert into public.eventos (slug, nombre, fecha, lugar, ciudad, genero, precio_desde, descripcion, portada) values
  ('subsuelo-presenta-octubre', 'Subsuelo Presenta: Octubre', '2026-10-03', 'Galpón Mecánica', 'Buenos Aires', 'Electrónica', 18000,
   'Primera fecha del ciclo. Dos pistas, sistema de sonido nuevo y cierre garantizado a las siete.', 'from-fuchsia-600 to-indigo-900'),
  ('la-maquina-de-humo-en-vivo', 'La Máquina de Humo — Disco nuevo en vivo', '2026-10-11', 'Sala Continental', 'Buenos Aires', 'Post-punk', 25000,
   'Presentación completa del disco, de principio a fin y en orden. Sin teloneros.', 'from-amber-500 to-red-800'),
  ('ruido-blanco-vol-4', 'Ruido Blanco vol. 4', '2026-10-18', 'Club Almagro', 'Buenos Aires', 'Noise rock', 12000,
   'Cuatro bandas, cuatro horas y protectores auditivos gratis en la entrada. No es un chiste.', 'from-emerald-500 to-slate-900'),
  ('matine-de-sotano', 'Matiné de Sótano', '2026-10-25', 'Depósito 9', 'La Plata', 'House', 9000,
   'De seis de la tarde a medianoche. Para los que ya no aguantan hasta las siete de la mañana.', 'from-orange-500 to-purple-900'),
  ('festival-vecinos', 'Festival Vecinos', '2026-11-08', 'Parque Sur', 'Rosario', 'Indie', 30000,
   'Al aire libre y con lluvia o sol. Tres escenarios y once proyectos en cartel.', 'from-sky-500 to-indigo-900'),
  ('cierre-de-temporada', 'Cierre de Temporada', '2026-11-22', 'Galpón Mecánica', 'Buenos Aires', 'Electrónica', 22000,
   'La última del año. Se agota siempre, todos los años, sin excepción.', 'from-rose-500 to-purple-900');

insert into public.evento_artistas (evento_id, artista_id, orden)
select e.id, a.id, v.orden
from (values
  ('subsuelo-presenta-octubre', 'nena-tornado', 1),
  ('subsuelo-presenta-octubre', 'dj-perejil', 2),
  ('la-maquina-de-humo-en-vivo', 'la-maquina-de-humo', 1),
  ('ruido-blanco-vol-4', 'el-club-del-ruido', 1),
  ('ruido-blanco-vol-4', 'coro-de-vecinos', 2),
  ('matine-de-sotano', 'dj-perejil', 1),
  ('festival-vecinos', 'coro-de-vecinos', 1),
  ('festival-vecinos', 'la-maquina-de-humo', 2),
  ('festival-vecinos', 'nena-tornado', 3),
  ('cierre-de-temporada', 'nena-tornado', 1),
  ('cierre-de-temporada', 'dj-perejil', 2),
  ('cierre-de-temporada', 'el-club-del-ruido', 3)
) as v (evento, artista, orden)
join public.eventos e on e.slug = v.evento
join public.artistas a on a.slug = v.artista;
