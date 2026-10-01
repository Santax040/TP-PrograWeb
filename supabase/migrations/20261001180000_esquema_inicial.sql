-- =============================================================================
-- Esquema inicial de la revista
--
-- Tablas de contenido (notas, artistas, eventos), perfiles de usuario con su
-- rol y su plan de suscripción, y los permisos de cada uno (RLS).
--
-- Roles:
--   usuario → se registra gratis, lee y puede escribir sus propias notas.
--   admin   → además maneja todo el contenido: notas ajenas, artistas, eventos.
--
-- Suscriptor NO es un rol: es el plan del usuario (libre/mensual/anual). Lo
-- asigna el sistema de pagos cuando exista, nunca el usuario.
-- =============================================================================


-- --- Tipos -------------------------------------------------------------------

create type public.rol_usuario as enum ('usuario', 'admin');
create type public.plan_suscripcion as enum ('libre', 'mensual', 'anual');
create type public.estado_nota as enum ('borrador', 'publicada');


-- --- Perfiles ----------------------------------------------------------------
-- Supabase guarda el login (mail y contraseña) en auth.users, que no se toca.
-- Acá va lo propio de la revista, con el mismo id.

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 60),
  rol public.rol_usuario not null default 'usuario',
  plan public.plan_suscripcion not null default 'libre',
  suscripcion_hasta date,
  creado_en timestamptz not null default now()
);

comment on column public.perfiles.suscripcion_hasta is
  'Hasta cuándo está paga la suscripción. Null en el plan libre.';

-- Al registrarse alguien, se le crea el perfil automáticamente.
create function public.crear_perfil()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nombre'), ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- ¿El usuario logueado es admin? Se usa en los permisos de todas las tablas.
-- Es "security definer" para poder leer perfiles sin caer en sus propios
-- permisos (si no, la consulta se llamaría a sí misma en bucle).
create function public.es_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = (select auth.uid()) and rol = 'admin'
  );
$$;

-- ¿El usuario logueado tiene una suscripción vigente?
create function public.es_suscriptor()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = (select auth.uid())
      and plan <> 'libre'
      and suscripcion_hasta >= current_date
  );
$$;


-- --- Contenido ---------------------------------------------------------------

create table public.categorias (
  slug text primary key,
  nombre text not null,
  orden smallint not null default 0
);

create table public.artistas (
  id bigint generated always as identity primary key,
  slug text not null unique,
  nombre text not null,
  genero text not null,
  bio text not null default ''
);

create table public.articulos (
  id bigint generated always as identity primary key,
  slug text not null unique,
  titulo text not null,
  bajada text not null default '',
  cuerpo text[] not null default '{}',
  categoria text not null references public.categorias (slug),
  autor_id uuid references public.perfiles (id) on delete set null,
  firma text not null default 'Redacción',
  fecha date not null default current_date,
  minutos_lectura smallint not null default 1 check (minutos_lectura > 0),
  destacado boolean not null default false,
  premium boolean not null default false,
  portada text not null default 'from-zinc-600 to-zinc-900',
  estado public.estado_nota not null default 'borrador',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

comment on column public.articulos.cuerpo is 'Un elemento por párrafo.';
comment on column public.articulos.firma is
  'Nombre que se muestra como autor. Las notas de la redacción no tienen autor_id.';
comment on column public.articulos.portada is
  'Clases de Tailwind del gradiente que hace de portada.';

create index articulos_categoria_idx on public.articulos (categoria);
create index articulos_autor_idx on public.articulos (autor_id);
create index articulos_fecha_idx on public.articulos (fecha desc);

-- Artistas mencionados en cada nota.
create table public.articulo_artistas (
  articulo_id bigint not null references public.articulos (id) on delete cascade,
  artista_id bigint not null references public.artistas (id) on delete cascade,
  primary key (articulo_id, artista_id)
);

create index articulo_artistas_artista_idx on public.articulo_artistas (artista_id);

create table public.eventos (
  id bigint generated always as identity primary key,
  slug text not null unique,
  nombre text not null,
  fecha date not null,
  lugar text not null,
  ciudad text not null,
  genero text not null,
  precio_desde integer not null check (precio_desde >= 0),
  descripcion text not null default '',
  portada text not null default 'from-zinc-600 to-zinc-900'
);

create index eventos_fecha_idx on public.eventos (fecha);

-- Line-up de cada evento. "orden" 1 es el cabeza de cartel.
create table public.evento_artistas (
  evento_id bigint not null references public.eventos (id) on delete cascade,
  artista_id bigint not null references public.artistas (id) on delete cascade,
  orden smallint not null default 1,
  primary key (evento_id, artista_id)
);

create index evento_artistas_artista_idx on public.evento_artistas (artista_id);


-- --- Reglas de las notas -----------------------------------------------------

-- Mantiene actualizado_en y protege los campos que el autor no puede tocar.
create function public.antes_de_guardar_articulo()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  new.actualizado_en := now();

  -- Sin usuario logueado es una carga interna (migraciones, consola de
  -- Supabase): no se aplican estas reglas. Desde la web anon no puede escribir.
  if (select auth.uid()) is not null and not public.es_admin() then
    if tg_op = 'INSERT' then
      -- Una nota nueva siempre queda a nombre de quien la escribe.
      new.autor_id := (select auth.uid());
      new.destacado := false;
    else
      -- El autor no puede pasarle la nota a otro ni destacarla en la portada.
      new.autor_id := old.autor_id;
      new.destacado := old.destacado;
    end if;
  end if;

  return new;
end;
$$;

create trigger antes_de_guardar_articulo
  before insert or update on public.articulos
  for each row execute function public.antes_de_guardar_articulo();


-- --- Permisos (Row Level Security) -------------------------------------------
-- Con RLS activado, una tabla no deja ver ni tocar nada salvo lo que permita
-- explícitamente una política. "anon" es el visitante sin login,
-- "authenticated" cualquiera que haya iniciado sesión.

alter table public.perfiles enable row level security;
alter table public.categorias enable row level security;
alter table public.artistas enable row level security;
alter table public.articulos enable row level security;
alter table public.articulo_artistas enable row level security;
alter table public.eventos enable row level security;
alter table public.evento_artistas enable row level security;

-- Perfiles: cada uno ve el suyo; el admin ve todos.
create policy "ver el propio perfil"
  on public.perfiles for select to authenticated
  using (id = (select auth.uid()) or (select public.es_admin()));

create policy "editar el propio perfil"
  on public.perfiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Del perfil, el usuario solo puede cambiar su nombre. Rol y plan quedan fuera
-- de su alcance aunque la política de arriba le deje editar la fila.
revoke update on public.perfiles from anon, authenticated;
grant update (nombre) on public.perfiles to authenticated;

-- Categorías, artistas, eventos y line-ups: los lee cualquiera, los edita el admin.
create policy "lectura publica" on public.categorias for select using (true);
create policy "solo admin" on public.categorias for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

create policy "lectura publica" on public.artistas for select using (true);
create policy "solo admin" on public.artistas for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

create policy "lectura publica" on public.eventos for select using (true);
create policy "solo admin" on public.eventos for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

create policy "lectura publica" on public.evento_artistas for select using (true);
create policy "solo admin" on public.evento_artistas for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

-- Notas: las publicadas las ve cualquiera; los borradores, solo su autor y el admin.
create policy "ver notas"
  on public.articulos for select
  using (
    estado = 'publicada'
    or autor_id = (select auth.uid())
    or (select public.es_admin())
  );

create policy "escribir notas"
  on public.articulos for insert to authenticated
  with check (true); -- el trigger fuerza autor_id = quien escribe

create policy "editar notas propias"
  on public.articulos for update to authenticated
  using (autor_id = (select auth.uid()) or (select public.es_admin()))
  with check (autor_id = (select auth.uid()) or (select public.es_admin()));

create policy "borrar notas propias"
  on public.articulos for delete to authenticated
  using (autor_id = (select auth.uid()) or (select public.es_admin()));

-- Artistas de cada nota: se ven si la nota se ve; los maneja quien maneja la nota.
create policy "ver artistas de notas"
  on public.articulo_artistas for select
  using (exists (select 1 from public.articulos a where a.id = articulo_id));

create policy "editar artistas de notas propias"
  on public.articulo_artistas for all to authenticated
  using (exists (
    select 1 from public.articulos a
    where a.id = articulo_id
      and (a.autor_id = (select auth.uid()) or (select public.es_admin()))
  ))
  with check (exists (
    select 1 from public.articulos a
    where a.id = articulo_id
      and (a.autor_id = (select auth.uid()) or (select public.es_admin()))
  ));
