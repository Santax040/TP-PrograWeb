-- Prueba de permisos por rol. Corre todo dentro de una transacción que se
-- deshace al final (rollback): no deja usuarios ni datos en la base.
--
-- Uso:  supabase db query --linked -f supabase/pruebas/permisos.sql
-- Cada fila tiene que decir OK (o el número esperado). Si alguna dice FALLA,
-- un permiso no se está cumpliendo.

begin;

create temp table resultados (n serial, prueba text, resultado text);
grant all on resultados to authenticated, anon;
grant all on sequence resultados_n_seq to authenticated, anon;

-- Usuarios de prueba (se borran con el rollback).
insert into auth.users (id, email, raw_user_meta_data, aud, role)
values
  ('00000000-0000-0000-0000-00000000000a', 'ana@prueba.test', '{"nombre":"Ana"}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-00000000000b', 'beto@prueba.test', '{}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-00000000000c', 'admin@prueba.test', '{"nombre":"Admin"}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-00000000000d', 'dani@prueba.test', '{"nombre":"Dani"}', 'authenticated', 'authenticated');

-- Solo puede haber un admin. Para la prueba, el admin real pasa a usuario
-- (el rollback del final lo devuelve) y el de prueba toma su lugar.
update public.perfiles set rol = 'usuario' where rol = 'admin';
update public.perfiles set rol = 'admin' where id = '00000000-0000-0000-0000-00000000000c';

do $$ begin
  update public.perfiles set rol = 'admin' where id = '00000000-0000-0000-0000-00000000000a';
  insert into resultados (prueba, resultado) values ('Segundo admin', 'FALLA: lo permitió');
exception when unique_violation then
  insert into resultados (prueba, resultado) values ('Segundo admin', 'OK: rechazado');
end $$;
update public.perfiles set rol = 'publicador' where id = '00000000-0000-0000-0000-00000000000a';

insert into resultados (prueba, resultado)
select 'perfil creado por trigger', string_agg(nombre || '/' || rol || '/' || plan, ', ' order by nombre)
from public.perfiles where id::text like '00000000-0000-0000-0000-00000000000%';

-- ===== Como Ana (publicadora) =====
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);

insert into public.articulos (slug, titulo, categoria, autor_id, destacado, estado)
values ('nota-de-ana', 'Nota de Ana', 'musica', '00000000-0000-0000-0000-00000000000b', true, 'borrador');
insert into resultados (prueba, resultado)
select 'Ana crea nota (intenta firmarla como Beto y destacarla)',
  case when autor_id = '00000000-0000-0000-0000-00000000000a' and not destacado then 'OK: queda a nombre de Ana, sin destacar' else 'FALLA' end
from public.articulos where slug = 'nota-de-ana';

with a as (
  insert into public.articulo_artistas (articulo_id, artista_id)
  select ar.id, at.id from public.articulos ar, public.artistas at
  where ar.slug = 'nota-de-ana' and at.slug = 'dj-perejil' returning 1)
insert into resultados (prueba, resultado) select 'Ana menciona un artista en su nota', case when count(*) = 1 then 'OK' else 'FALLA' end from a;

do $$ begin
  insert into public.articulo_artistas (articulo_id, artista_id)
  select ar.id, at.id from public.articulos ar, public.artistas at
  where ar.slug = 'guia-de-sotanos' and at.slug = 'dj-perejil';
  insert into resultados (prueba, resultado) values ('Ana agrega artista a nota ajena', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Ana agrega artista a nota ajena', 'OK: rechazado');
end $$;

update public.articulos set titulo = 'hackeado' where slug = 'guia-de-sotanos';
insert into resultados (prueba, resultado)
select 'Ana edita nota de la redacción', case when titulo = 'hackeado' then 'FALLA' else 'OK: sin efecto' end
from public.articulos where slug = 'guia-de-sotanos';

with s as (update public.perfiles set nombre = 'Ana B.' where id = '00000000-0000-0000-0000-00000000000a' returning 1)
insert into resultados (prueba, resultado) select 'Ana cambia su nombre', case when count(*) = 1 then 'OK' else 'FALLA' end from s;

do $$ begin
  update public.perfiles set rol = 'admin' where id = '00000000-0000-0000-0000-00000000000a';
  insert into resultados (prueba, resultado) values ('Ana se pone rol admin', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Ana se pone rol admin', 'OK: rechazado');
end $$;

do $$ begin
  update public.perfiles set plan = 'anual', suscripcion_hasta = '2099-01-01' where id = '00000000-0000-0000-0000-00000000000a';
  insert into resultados (prueba, resultado) values ('Ana se regala suscripción', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Ana se regala suscripción', 'OK: rechazado');
end $$;

insert into resultados (prueba, resultado)
select 'Ana ve perfiles', count(*)::text || ' (debe ser 1: el suyo)' from public.perfiles;

do $$ begin
  insert into public.artistas (slug, nombre, genero) values ('x', 'x', 'x');
  insert into resultados (prueba, resultado) values ('Ana crea artista', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Ana crea artista', 'OK: rechazado');
end $$;

-- ===== Como Beto (otro usuario común) =====
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);

insert into resultados (prueba, resultado)
select 'Beto ve el borrador de Ana', case when count(*) = 0 then 'OK: no lo ve' else 'FALLA' end
from public.articulos where slug = 'nota-de-ana';

with b as (delete from public.articulos where slug = 'nota-de-ana' returning 1)
insert into resultados (prueba, resultado) select 'Beto borra la nota de Ana', case when count(*) = 0 then 'OK: sin efecto' else 'FALLA' end from b;

do $$ begin
  insert into public.articulos (slug, titulo, categoria) values ('nota-de-beto', 'Nota de Beto', 'musica');
  insert into resultados (prueba, resultado) values ('Beto (usuario) escribe una nota', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Beto (usuario) escribe una nota', 'OK: rechazado');
end $$;

-- Propuestas
with e as (
  insert into public.envios (tipo, titulo, datos)
  values ('nota', 'Mi nota sobre el under', '{"texto":"Hola"}') returning autor_id, estado)
insert into resultados (prueba, resultado)
select 'Beto manda una propuesta',
  case when autor_id = '00000000-0000-0000-0000-00000000000b' and estado = 'nuevo' then 'OK: a su nombre, estado nuevo' else 'FALLA' end
from e;

do $$ begin
  insert into public.envios (tipo, titulo, estado) values ('nota', 'Me la apruebo solo', 'aceptado');
  insert into resultados (prueba, resultado) values ('Beto manda propuesta ya aceptada', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Beto manda propuesta ya aceptada', 'OK: rechazado');
end $$;

-- La política de update es solo para admin: a Beto no le tira error, pero
-- el update no encuentra filas que pueda tocar y no cambia nada.
update public.envios set estado = 'aceptado' where titulo = 'Mi nota sobre el under';
insert into resultados (prueba, resultado)
select 'Beto acepta su propia propuesta', case when estado = 'nuevo' then 'OK: sin efecto' else 'FALLA' end
from public.envios where titulo = 'Mi nota sobre el under';

do $$ begin
  insert into public.envios (tipo, titulo, autor_id)
  values ('nota', 'A nombre de Ana', '00000000-0000-0000-0000-00000000000a');
  insert into resultados (prueba, resultado) values ('Beto manda propuesta a nombre de Ana', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Beto manda propuesta a nombre de Ana', 'OK: rechazado');
end $$;

insert into resultados (prueba, resultado)
select 'Beto ve sus propuestas', count(*)::text || ' (debe ser 1)' from public.envios;

-- Cuatro más, para llegar a 5 (fuera del bloque de abajo: si la sexta falla,
-- el bloque se deshace entero y se llevaría también a estas).
insert into public.envios (tipo, titulo)
select 'artista', 'Propuesta ' || i from generate_series(1, 4) as i;

do $$ begin
  insert into public.envios (tipo, titulo) values ('artista', 'La sexta del día');
  insert into resultados (prueba, resultado) values ('Beto manda la 6ª propuesta del día', 'FALLA: lo permitió');
exception when raise_exception then
  insert into resultados (prueba, resultado) values ('Beto manda la 6ª propuesta del día', 'OK: rechazado por el límite');
end $$;

-- ===== Como Dani (usuaria que se hace artista) =====
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000d","role":"authenticated"}', true);

do $$ begin
  perform public.elegir_ser_artista(true);
  insert into resultados (prueba, resultado) values ('Dani se pasa a artista sin aceptar la declaración', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Dani se pasa a artista sin aceptar la declaración', 'OK: rechazado');
end $$;

insert into resultados (prueba, resultado)
select 'Dani elige ser artista (acepta la declaración)',
  case when public.elegir_ser_artista(true, true) = 'artista' then 'OK' else 'FALLA' end;

do $$ begin
  insert into public.articulos (slug, titulo, categoria) values ('nota-de-dani', 'Nota de Dani', 'musica');
  insert into resultados (prueba, resultado) values ('Dani (artista) escribe una nota', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Dani (artista) escribe una nota', 'OK: rechazado');
end $$;

with e as (insert into public.envios (tipo, titulo) values ('artista', 'Mi proyecto') returning 1)
insert into resultados (prueba, resultado) select 'Dani (artista) manda una propuesta', case when count(*) = 1 then 'OK' else 'FALLA' end from e;

do $$ begin
  update public.perfiles set rol = 'publicador' where id = '00000000-0000-0000-0000-00000000000d';
  insert into resultados (prueba, resultado) values ('Dani se pone publicador', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Dani se pone publicador', 'OK: rechazado');
end $$;

insert into resultados (prueba, resultado)
select 'Dani deja de ser artista', case when public.elegir_ser_artista(false) = 'usuario' then 'OK' else 'FALLA' end;

-- Ana (publicadora) no puede usar el botón de artista: perdería su rol.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
do $$ begin
  perform public.elegir_ser_artista(true);
  insert into resultados (prueba, resultado) values ('Ana (publicadora) se pasa a artista', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Ana (publicadora) se pasa a artista', 'OK: rechazado');
end $$;

-- Ana (publicadora) no ve propuestas ajenas.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
insert into resultados (prueba, resultado)
select 'Ana ve propuestas de Beto', case when count(*) = 0 then 'OK: no las ve' else 'FALLA' end from public.envios;

-- ===== Visitante sin login =====
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
insert into resultados (prueba, resultado)
select 'Visitante ve el borrador de Ana', case when count(*) = 0 then 'OK: no lo ve' else 'FALLA' end
from public.articulos where slug = 'nota-de-ana';
-- Desde "negar por defecto" (2026-10-28) el visitante ni siquiera puede
-- consultar estas tablas: la base rechaza la consulta, no devuelve 0 filas.
do $$ begin
  perform 1 from public.perfiles;
  insert into resultados (prueba, resultado) values ('Visitante ve perfiles', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Visitante ve perfiles', 'OK: rechazado');
end $$;
do $$ begin
  perform 1 from public.envios;
  insert into resultados (prueba, resultado) values ('Visitante ve propuestas', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Visitante ve propuestas', 'OK: rechazado');
end $$;

do $$ begin
  insert into public.envios (tipo, titulo) values ('nota', 'Sin login');
  insert into resultados (prueba, resultado) values ('Visitante manda propuesta', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Visitante manda propuesta', 'OK: rechazado');
end $$;

do $$ begin
  perform public.elegir_ser_artista(true);
  insert into resultados (prueba, resultado) values ('Visitante usa "ser artista"', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Visitante usa "ser artista"', 'OK: rechazado');
end $$;

-- ===== Como admin =====
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000c","role":"authenticated"}', true);

insert into resultados (prueba, resultado)
select 'Admin ve el borrador de Ana', case when count(*) = 1 then 'OK' else 'FALLA' end
from public.articulos where slug = 'nota-de-ana';

with u as (update public.articulos set destacado = true, estado = 'publicada' where slug = 'nota-de-ana' returning destacado)
insert into resultados (prueba, resultado) select 'Admin publica y destaca la nota de Ana', case when bool_and(destacado) then 'OK' else 'FALLA' end from u;

with a as (insert into public.artistas (slug, nombre, genero) values ('artista-prueba', 'Prueba', 'Test') returning 1)
insert into resultados (prueba, resultado) select 'Admin crea artista', case when count(*) = 1 then 'OK' else 'FALLA' end from a;

insert into resultados (prueba, resultado)
select 'Admin ve perfiles', count(*)::text || ' (al menos los 3 de prueba)' from public.perfiles;

insert into resultados (prueba, resultado)
select 'Admin ve las propuestas de Beto', count(*)::text || ' (deben ser 5)' from public.envios
where autor_id = '00000000-0000-0000-0000-00000000000b';

with u as (update public.envios set estado = 'aceptado' where titulo = 'Mi nota sobre el under' returning 1)
insert into resultados (prueba, resultado) select 'Admin acepta una propuesta', case when count(*) = 1 then 'OK' else 'FALLA' end from u;

-- ===== Fotos de portada (Storage) =====
-- Ana, publicadora, sube en su carpeta.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
with s as (
  insert into storage.objects (bucket_id, name, owner_id)
  values ('portadas', '00000000-0000-0000-0000-00000000000a/foto.webp', '00000000-0000-0000-0000-00000000000a')
  returning 1)
insert into resultados (prueba, resultado) select 'Ana sube una portada en su carpeta', case when count(*) = 1 then 'OK' else 'FALLA' end from s;

do $$ begin
  insert into storage.objects (bucket_id, name) values ('portadas', '00000000-0000-0000-0000-00000000000b/ajena.webp');
  insert into resultados (prueba, resultado) values ('Ana sube en la carpeta de Beto', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Ana sube en la carpeta de Beto', 'OK: rechazado');
end $$;

do $$ begin
  update public.articulos set portada_url = 'https://otro-sitio.com/foto.jpg' where slug = 'nota-de-ana';
  insert into resultados (prueba, resultado) values ('Nota con foto de otro sitio', 'FALLA: lo permitió');
exception when check_violation then
  insert into resultados (prueba, resultado) values ('Nota con foto de otro sitio', 'OK: rechazado');
end $$;

-- Beto, usuario común, no sube.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);
do $$ begin
  insert into storage.objects (bucket_id, name) values ('portadas', '00000000-0000-0000-0000-00000000000b/mia.webp');
  insert into resultados (prueba, resultado) values ('Beto (usuario) sube una portada', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Beto (usuario) sube una portada', 'OK: rechazado');
end $$;

-- ===== Música =====
-- Dani vuelve a ser artista (la declaración ya la aceptó antes), arma su
-- ficha y sube un tema.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000d","role":"authenticated"}', true);
insert into resultados (prueba, resultado)
select 'Dani vuelve a ser artista sin repetir la declaración',
  case when public.elegir_ser_artista(true) = 'artista' then 'OK' else 'FALLA' end;

insert into resultados (prueba, resultado)
select 'Dani crea su ficha', case when public.guardar_mi_ficha('Dani Ñandú', 'Minimal', 'Hola') = 'dani-nandu' then 'OK: slug dani-nandu' else 'FALLA' end;

insert into resultados (prueba, resultado)
select 'Dani edita su ficha (el slug no cambia)',
  case when public.guardar_mi_ficha('Dani Otra', 'House', '') = 'dani-nandu' then 'OK' else 'FALLA' end;

with s as (
  insert into storage.objects (bucket_id, name, owner_id)
  values ('musica', '00000000-0000-0000-0000-00000000000d/tema.mp3', '00000000-0000-0000-0000-00000000000d')
  returning 1)
insert into resultados (prueba, resultado) select 'Dani sube un audio en su carpeta', case when count(*) = 1 then 'OK' else 'FALLA' end from s;

do $$ begin
  insert into storage.objects (bucket_id, name) values ('musica', '00000000-0000-0000-0000-00000000000b/ajeno.mp3');
  insert into resultados (prueba, resultado) values ('Dani sube audio en la carpeta de Beto', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Dani sube audio en la carpeta de Beto', 'OK: rechazado');
end $$;

with c as (
  insert into public.canciones (slug, titulo, artista_id, duracion_seg, archivo, publicada, subida_por)
  select 'tema-de-dani', 'Tema de Dani', id, 200, '00000000-0000-0000-0000-00000000000d/tema.mp3', false,
    '00000000-0000-0000-0000-00000000000b'
  from public.artistas where slug = 'dani-nandu'
  returning subida_por)
insert into resultados (prueba, resultado)
select 'Dani guarda su tema (intenta firmarlo como Beto)',
  case when subida_por = '00000000-0000-0000-0000-00000000000d' then 'OK: queda a nombre de Dani' else 'FALLA' end from c;

do $$ begin
  insert into public.canciones (slug, titulo, artista_id, duracion_seg, archivo)
  select 'robado', 'Robado', id, 200, 'semilla/otro.mp3' from public.artistas where slug = 'dani-nandu';
  insert into resultados (prueba, resultado) values ('Dani guarda un tema con archivo ajeno', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Dani guarda un tema con archivo ajeno', 'OK: rechazado');
end $$;

do $$ begin
  insert into public.canciones (slug, titulo, artista_id, duracion_seg, archivo)
  select 'a-nombre-de-otro', 'A nombre de otro', id, 200, '00000000-0000-0000-0000-00000000000d/x.mp3'
  from public.artistas where slug = 'dj-perejil';
  insert into resultados (prueba, resultado) values ('Dani sube un tema a la ficha de DJ Perejil', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Dani sube un tema a la ficha de DJ Perejil', 'OK: rechazado');
end $$;

insert into resultados (prueba, resultado)
select 'Dani ve su tema oculto', case when count(*) = 1 then 'OK' else 'FALLA' end
from public.canciones where slug = 'tema-de-dani';

-- Beto, usuario común: ni ficha, ni audio, ni tocar el tema de Dani.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);

do $$ begin
  perform public.guardar_mi_ficha('Beto', 'Rock', '');
  insert into resultados (prueba, resultado) values ('Beto (usuario) crea ficha de artista', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Beto (usuario) crea ficha de artista', 'OK: rechazado');
end $$;

do $$ begin
  insert into storage.objects (bucket_id, name) values ('musica', '00000000-0000-0000-0000-00000000000b/mio.mp3');
  insert into resultados (prueba, resultado) values ('Beto (usuario) sube audio', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Beto (usuario) sube audio', 'OK: rechazado');
end $$;

insert into resultados (prueba, resultado)
select 'Beto ve el tema oculto de Dani', case when count(*) = 0 then 'OK: no lo ve' else 'FALLA' end
from public.canciones where slug = 'tema-de-dani';

insert into resultados (prueba, resultado)
select 'Beto ve audios del bucket', count(*)::text || ' (debe ser 0)' from storage.objects where bucket_id = 'musica';

-- Dani publica su tema: ahora lo ve cualquiera, pero el archivo no.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000d","role":"authenticated"}', true);
update public.canciones set publicada = true where slug = 'tema-de-dani';

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
insert into resultados (prueba, resultado)
select 'Visitante ve el tema publicado de Dani', case when count(*) = 1 then 'OK' else 'FALLA' end
from public.canciones where slug = 'tema-de-dani';
insert into resultados (prueba, resultado)
select 'Visitante ve audios del bucket', count(*)::text || ' (debe ser 0)' from storage.objects where bucket_id = 'musica';

-- ===== Disquería =====
-- Dani pone precio. No puede inflar las ventas, retirar a mano ni habilitarse
-- la venta sin conectar Mercado Pago.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000d","role":"authenticated"}', true);

with u as (
  update public.canciones set precio = 500, ventas = 99, retirada_en = now()
  where slug = 'tema-de-dani' returning precio, ventas, retirada_en)
insert into resultados (prueba, resultado)
select 'Dani pone precio (intenta inflar ventas y retirar a mano)',
  case when precio = 500 and ventas = 0 and retirada_en is null then 'OK: solo cambia el precio' else 'FALLA' end from u;

do $$ begin
  update public.canciones set precio = 50 where slug = 'tema-de-dani';
  insert into resultados (prueba, resultado) values ('Precio de $50 (menos del mínimo)', 'FALLA: lo permitió');
exception when check_violation then
  insert into resultados (prueba, resultado) values ('Precio de $50 (menos del mínimo)', 'OK: rechazado');
end $$;

update public.artistas set puede_vender = true where slug = 'dani-nandu';
insert into resultados (prueba, resultado)
select 'Dani se habilita la venta a mano', case when not puede_vender then 'OK: sigue sin poder vender' else 'FALLA' end
from public.artistas where slug = 'dani-nandu';

do $$ begin
  perform public.guardar_cuenta_mp('00000000-0000-0000-0000-00000000000d', 1, 'x', 'x', 'x', now());
  insert into resultados (prueba, resultado) values ('Dani guarda una cuenta de Mercado Pago', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Dani guarda una cuenta de Mercado Pago', 'OK: rechazado');
end $$;

do $$ begin
  perform 1 from privado.cuentas_mp;
  insert into resultados (prueba, resultado) values ('Dani lee las cuentas de Mercado Pago', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Dani lee las cuentas de Mercado Pago', 'OK: rechazado');
end $$;

do $$ begin
  perform public.acreditar_compra(1, '00000000-0000-0000-0000-00000000000d', 1, 1);
  insert into resultados (prueba, resultado) values ('Dani acredita una compra', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Dani acredita una compra', 'OK: rechazado');
end $$;

-- Beto no puede bajar gratis un tema pago ni anotarse compras.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);

do $$ begin
  perform public.obtener_gratis((select id from public.canciones where slug = 'tema-de-dani'));
  insert into resultados (prueba, resultado) values ('Beto baja gratis un tema pago', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Beto baja gratis un tema pago', 'OK: rechazado');
end $$;

do $$ begin
  insert into public.compras (usuario_id, cancion_id, monto)
  select '00000000-0000-0000-0000-00000000000b', id, 0 from public.canciones where slug = 'tema-de-dani';
  insert into resultados (prueba, resultado) values ('Beto se anota una compra', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Beto se anota una compra', 'OK: rechazado');
end $$;

-- Dani lo pone gratis y Beto lo baja (dos veces: cuenta una).
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000d","role":"authenticated"}', true);
update public.canciones set precio = 0 where slug = 'tema-de-dani';

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);
select public.obtener_gratis(id) from public.canciones where slug = 'tema-de-dani';
select public.obtener_gratis(id) from public.canciones where slug = 'tema-de-dani';
insert into resultados (prueba, resultado)
select 'Beto baja el tema gratis (dos veces)',
  case when ventas = 1 then 'OK: una venta' else 'FALLA: ' || ventas end
from public.canciones where slug = 'tema-de-dani';
insert into resultados (prueba, resultado)
select 'Beto ve sus compras', count(*)::text || ' (debe ser 1)' from public.compras;

-- Dani ve cuánto vendió, pero no quién compró.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000d","role":"authenticated"}', true);
insert into resultados (prueba, resultado)
select 'Dani ve las compras de Beto', count(*)::text || ' (debe ser 0)' from public.compras;
insert into resultados (prueba, resultado)
select 'Dani ve sus ventas', case when sum(cantidad) = 1 then 'OK: 1 venta' else 'FALLA' end from public.mis_ventas();

-- Un tema vendido no se borra: se retira y no vuelve a mostrarse.
do $$ begin
  delete from public.canciones where slug = 'tema-de-dani';
  insert into resultados (prueba, resultado) values ('Dani borra un tema vendido', 'FALLA: lo permitió');
exception when foreign_key_violation then
  insert into resultados (prueba, resultado) values ('Dani borra un tema vendido', 'OK: rechazado (se retira)');
end $$;

select public.retirar_cancion(id) from public.canciones where slug = 'tema-de-dani';
update public.canciones set publicada = true where slug = 'tema-de-dani';
insert into resultados (prueba, resultado)
select 'Dani retira el tema e intenta volver a mostrarlo',
  case when not publicada and retirada_en is not null then 'OK: sigue retirado' else 'FALLA' end
from public.canciones where slug = 'tema-de-dani';

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);
insert into resultados (prueba, resultado)
select 'Beto conserva el tema retirado', count(*)::text || ' (debe ser 1)' from public.compras;

do $$ begin
  perform public.retirar_cancion((select cancion_id from public.compras limit 1));
  insert into resultados (prueba, resultado) values ('Beto retira un tema ajeno', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Beto retira un tema ajeno', 'OK: rechazado');
end $$;

-- Un artista de antes de la declaración no sube hasta aceptarla.
reset role;
update public.perfiles set derechos_aceptados_en = null where id = '00000000-0000-0000-0000-00000000000d';
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000d","role":"authenticated"}', true);

do $$ begin
  insert into storage.objects (bucket_id, name) values ('musica', '00000000-0000-0000-0000-00000000000d/otro.mp3');
  insert into resultados (prueba, resultado) values ('Artista sin declaración sube audio', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Artista sin declaración sube audio', 'OK: rechazado');
end $$;

do $$ begin
  insert into public.canciones (slug, titulo, artista_id, duracion_seg, archivo)
  select 'sin-declaracion', 'Sin declaración', id, 200, '00000000-0000-0000-0000-00000000000d/otro.mp3'
  from public.artistas where slug = 'dani-nandu';
  insert into resultados (prueba, resultado) values ('Artista sin declaración guarda un tema', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Artista sin declaración guarda un tema', 'OK: rechazado');
end $$;

insert into resultados (prueba, resultado)
select 'Dani acepta la declaración', case when public.aceptar_derechos() is not null then 'OK' else 'FALLA' end;

-- El servidor (clave secreta) acredita un pago: dos avisos del mismo pago
-- cuentan una sola venta. Y guarda la cuenta de Mercado Pago de Dani.
reset role;
select set_config('request.jwt.claims', '', true);
update public.canciones set precio = 1000, retirada_en = null, publicada = true where slug = 'tema-de-dani';
select public.acreditar_compra(777, '00000000-0000-0000-0000-00000000000a', id, 1500) from public.canciones where slug = 'tema-de-dani';
select public.acreditar_compra(777, '00000000-0000-0000-0000-00000000000a', id, 1500) from public.canciones where slug = 'tema-de-dani';
insert into resultados (prueba, resultado)
select 'Servidor acredita el mismo pago dos veces',
  case when ventas = 2 then 'OK: suma una venta' else 'FALLA: ' || ventas end
from public.canciones where slug = 'tema-de-dani';

select public.guardar_cuenta_mp('00000000-0000-0000-0000-00000000000d', 123, 'tok', 'ref', 'pub', now() + interval '180 days');
insert into resultados (prueba, resultado)
select 'Servidor conecta Mercado Pago de Dani', case when puede_vender then 'OK: puede vender' else 'FALLA' end
from public.artistas where slug = 'dani-nandu';

do $$ begin
  perform public.guardar_cuenta_mp('00000000-0000-0000-0000-00000000000b', 124, 'tok', 'ref', 'pub', now());
  insert into resultados (prueba, resultado) values ('Servidor conecta Mercado Pago de Beto (no es artista)', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Servidor conecta Mercado Pago de Beto (no es artista)', 'OK: rechazado');
end $$;

-- Dani deja de ser artista: deja de vender y se borra su conexión.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000d","role":"authenticated"}', true);
select public.elegir_ser_artista(false);
reset role;
insert into resultados (prueba, resultado)
select 'Dani deja de ser artista: deja de vender',
  case when not a.puede_vender and not exists (select 1 from privado.cuentas_mp where perfil_id = a.perfil_id)
    then 'OK' else 'FALLA' end
from public.artistas a where slug = 'dani-nandu';

-- ===== Notas exclusivas y negar por defecto =====
-- Una nota exclusiva publicada y una en borrador, de la redacción, con tres
-- párrafos. El trigger tiene que dejar en `articulos` solo el primero.
reset role;
select set_config('request.jwt.claims', '', true);
insert into public.articulos (slug, titulo, categoria, cuerpo, premium, estado)
values
  ('exclusiva-prueba', 'Exclusiva', 'musica', array['uno', 'dos', 'tres'], true, 'publicada'),
  ('exclusiva-borrador', 'Exclusiva en borrador', 'musica', array['uno', 'dos', 'tres'], true, 'borrador');
insert into public.articulos_premium (articulo_id, cuerpo)
select id, array['uno', 'dos', 'tres'] from public.articulos where slug in ('exclusiva-prueba', 'exclusiva-borrador');
create temp table ids_exclusivas as
select slug, id from public.articulos where slug in ('exclusiva-prueba', 'exclusiva-borrador');
grant select on ids_exclusivas to authenticated, anon;
insert into public.pagos (id, usuario_id, plan, monto)
values (999001, '00000000-0000-0000-0000-00000000000a', 'mensual', 3500);
-- Beto arranca sin suscripción.
update public.perfiles set plan = 'libre', suscripcion_hasta = null where id = '00000000-0000-0000-0000-00000000000b';

insert into resultados (prueba, resultado)
select 'Exclusiva: en articulos queda solo el adelanto',
  case when cuerpo = array['uno'] then 'OK' else 'FALLA: ' || array_to_string(cuerpo, '/') end
from public.articulos where slug = 'exclusiva-prueba';

insert into public.articulos (slug, titulo, categoria, cuerpo, premium, estado)
values ('exclusiva-corta', 'Exclusiva corta', 'musica', array['unico'], true, 'publicada');
insert into resultados (prueba, resultado)
select 'Exclusiva de un párrafo: en articulos no queda nada',
  case when cardinality(cuerpo) = 0 then 'OK' else 'FALLA' end
from public.articulos where slug = 'exclusiva-corta';

-- Visitante
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$ begin
  perform 1 from public.articulos_premium;
  insert into resultados (prueba, resultado) values ('Visitante lee texto exclusivo', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Visitante lee texto exclusivo', 'OK: rechazado');
end $$;
insert into resultados (prueba, resultado)
select 'Visitante lee el cuerpo de la exclusiva en articulos',
  case when cardinality(cuerpo) = 1 then 'OK: solo el adelanto' else 'FALLA' end
from public.articulos where slug = 'exclusiva-prueba';
do $$ begin
  perform 1 from public.pagos;
  insert into resultados (prueba, resultado) values ('Visitante consulta pagos', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Visitante consulta pagos', 'OK: rechazado');
end $$;
do $$ begin
  perform 1 from public.compras;
  insert into resultados (prueba, resultado) values ('Visitante consulta compras', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Visitante consulta compras', 'OK: rechazado');
end $$;
do $$ begin
  perform 1 from public.perfiles;
  insert into resultados (prueba, resultado) values ('Visitante consulta perfiles', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Visitante consulta perfiles', 'OK: rechazado');
end $$;

-- Beto, logueado sin suscripción
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);
insert into resultados (prueba, resultado)
select 'Beto (sin suscripción) lee texto exclusivo', count(*)::text || ' (debe ser 0)' from public.articulos_premium;
insert into resultados (prueba, resultado)
select 'Beto ve pagos ajenos', count(*)::text || ' (debe ser 0)' from public.pagos;

do $$ begin
  insert into public.pagos (id, usuario_id, plan, monto)
  values (999002, '00000000-0000-0000-0000-00000000000b', 'anual', 1);
  insert into resultados (prueba, resultado) values ('Beto se carga un pago', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Beto se carga un pago', 'OK: rechazado');
end $$;

do $$ begin
  insert into public.compras (usuario_id, cancion_id, monto)
  select '00000000-0000-0000-0000-00000000000b', id, 0 from public.canciones limit 1;
  insert into resultados (prueba, resultado) values ('Beto se carga una compra', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Beto se carga una compra', 'OK: rechazado');
end $$;

do $$ begin
  insert into public.articulos_premium (articulo_id, cuerpo)
  select id, array['hackeado'] from public.articulos where slug = 'exclusiva-prueba'
  on conflict (articulo_id) do update set cuerpo = excluded.cuerpo;
  insert into resultados (prueba, resultado) values ('Beto edita el texto exclusivo', 'FALLA: lo permitió');
exception when insufficient_privilege then
  insert into resultados (prueba, resultado) values ('Beto edita el texto exclusivo', 'OK: rechazado');
end $$;

-- Beto con suscripción vigente (la acredita el servidor)
reset role;
update public.perfiles set plan = 'mensual', suscripcion_hasta = current_date + 30
where id = '00000000-0000-0000-0000-00000000000b';
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);
insert into resultados (prueba, resultado)
select 'Beto (suscriptor) lee la exclusiva publicada',
  case when cardinality(p.cuerpo) = 3 then 'OK: completa' else 'FALLA' end
from public.articulos_premium p join public.articulos a on a.id = p.articulo_id
where a.slug = 'exclusiva-prueba';
-- El id sale de ids_exclusivas: Beto no ve el borrador en `articulos`, y
-- buscarlo por ahí daría 0 aunque la política estuviera mal.
insert into resultados (prueba, resultado)
select 'Beto (suscriptor) lee el texto de una exclusiva en borrador', count(*)::text || ' (debe ser 0)'
from public.articulos_premium p join ids_exclusivas i on i.id = p.articulo_id
where i.slug = 'exclusiva-borrador';

-- Beto con la suscripción vencida
reset role;
update public.perfiles set suscripcion_hasta = current_date - 1
where id = '00000000-0000-0000-0000-00000000000b';
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);
insert into resultados (prueba, resultado)
select 'Beto (suscripción vencida) lee texto exclusivo', count(*)::text || ' (debe ser 0)' from public.articulos_premium;

-- Admin lee el texto exclusivo (para editarlo)
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000c","role":"authenticated"}', true);
insert into resultados (prueba, resultado)
select 'Admin lee el texto exclusivo', count(*)::text || ' (al menos 2: las de prueba, más las reales)' from public.articulos_premium;

reset role;
select prueba, resultado from resultados order by n;

rollback;
