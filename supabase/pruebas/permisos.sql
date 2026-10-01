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
  ('00000000-0000-0000-0000-00000000000c', 'admin@prueba.test', '{"nombre":"Admin"}', 'authenticated', 'authenticated');
update public.perfiles set rol = 'admin' where id = '00000000-0000-0000-0000-00000000000c';

insert into resultados (prueba, resultado)
select 'perfil creado por trigger', string_agg(nombre || '/' || rol || '/' || plan, ', ' order by nombre)
from public.perfiles where id::text like '00000000-0000-0000-0000-00000000000%';

-- ===== Como Ana (usuario común) =====
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

-- ===== Visitante sin login =====
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
insert into resultados (prueba, resultado)
select 'Visitante ve notas', count(*)::text || ' (deben ser 6 publicadas, sin el borrador)' from public.articulos;
insert into resultados (prueba, resultado)
select 'Visitante ve perfiles', count(*)::text || ' (debe ser 0)' from public.perfiles;

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

reset role;
select prueba, resultado from resultados order by n;

rollback;
