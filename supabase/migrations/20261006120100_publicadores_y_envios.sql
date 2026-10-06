-- =============================================================================
-- Publicadores oficiales y propuestas de los lectores
--
-- Cambia quién puede escribir:
--   usuario     → lee y MANDA PROPUESTAS (nota, evento o artista). No publica.
--   publicador  → escribe y publica sus notas (antes podía cualquier usuario).
--   admin       → todo, y recibe las propuestas.
--
-- Las propuestas se guardan en `envios` y además le llega un mail al admin
-- (lo manda el sitio, ver src/app/colabora/acciones.js). Guardarlas en la base
-- hace que no se pierdan si el mail falla o cae en spam.
-- =============================================================================


-- --- Quién puede escribir notas ----------------------------------------------

create function privado.es_publicador()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = (select auth.uid()) and rol in ('publicador', 'admin')
  );
$$;

drop policy "escribir notas" on public.articulos;
create policy "publicadores escriben notas"
  on public.articulos for insert to authenticated
  with check ((select privado.es_publicador()));

-- Editar y borrar: el autor sigue pudiendo con las suyas, pero solo si
-- todavía es publicador. Si deja de serlo, sus notas quedan en manos del admin.
drop policy "editar notas propias" on public.articulos;
create policy "editar notas propias"
  on public.articulos for update to authenticated
  using (
    (autor_id = (select auth.uid()) and (select privado.es_publicador()))
    or (select privado.es_admin())
  )
  with check (
    (autor_id = (select auth.uid()) and (select privado.es_publicador()))
    or (select privado.es_admin())
  );

drop policy "borrar notas propias" on public.articulos;
create policy "borrar notas propias"
  on public.articulos for delete to authenticated
  using (
    (autor_id = (select auth.uid()) and (select privado.es_publicador()))
    or (select privado.es_admin())
  );

-- Mencionar artistas en una nota: mismo criterio.
create or replace function privado.puede_editar_articulo(id_articulo bigint)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.articulos a
    where a.id = id_articulo
      and (
        (a.autor_id = (select auth.uid()) and privado.es_publicador())
        or privado.es_admin()
      )
  );
$$;


-- --- Propuestas de los lectores ----------------------------------------------

create type public.tipo_envio as enum ('nota', 'evento', 'artista');
create type public.estado_envio as enum ('nuevo', 'leido', 'aceptado', 'descartado');

create table public.envios (
  id bigint generated always as identity primary key,
  autor_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  tipo public.tipo_envio not null,
  titulo text not null check (char_length(titulo) between 3 and 140),
  -- Los campos de cada tipo (texto de la nota, fecha y lugar del evento,
  -- bio del artista...). Ver `camposPorTipo` en src/lib/envios.js.
  datos jsonb not null default '{}'::jsonb check (pg_column_size(datos) < 40000),
  estado public.estado_envio not null default 'nuevo',
  creado_en timestamptz not null default now()
);

comment on table public.envios is
  'Propuestas de los lectores. No se publican: las revisa el admin.';

create index envios_autor_idx on public.envios (autor_id);
create index envios_estado_idx on public.envios (estado, creado_en desc);

alter table public.envios enable row level security;

-- Mandar: cualquiera con sesión, siempre a su nombre.
create policy "mandar propuestas"
  on public.envios for insert to authenticated
  with check (autor_id = (select auth.uid()) and estado = 'nuevo');

-- Ver: cada uno las suyas; el admin, todas.
create policy "ver propuestas"
  on public.envios for select to authenticated
  using (autor_id = (select auth.uid()) or (select privado.es_admin()));

-- Cambiar el estado o borrar: solo el admin.
create policy "admin revisa propuestas"
  on public.envios for update to authenticated
  using ((select privado.es_admin())) with check ((select privado.es_admin()));

create policy "admin borra propuestas"
  on public.envios for delete to authenticated
  using ((select privado.es_admin()));

-- El usuario no puede elegir el estado ni la fecha al mandar, solo el contenido.
revoke insert, update on public.envios from anon, authenticated;
grant insert (tipo, titulo, datos) on public.envios to authenticated;
grant update (estado) on public.envios to authenticated;

-- Freno anti-spam: hasta 5 propuestas por persona cada 24 horas.
create function privado.limitar_envios()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if (
    select count(*) from public.envios
    where autor_id = new.autor_id and creado_en > now() - interval '24 hours'
  ) >= 5 then
    raise exception 'Llegaste al límite de 5 propuestas por día.'
      using errcode = 'P0001', hint = 'limite_envios';
  end if;
  return new;
end;
$$;

revoke execute on function privado.limitar_envios() from public, anon, authenticated;

create trigger limitar_envios
  before insert on public.envios
  for each row execute function privado.limitar_envios();
