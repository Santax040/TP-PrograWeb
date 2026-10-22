-- =============================================================================
-- Música: los artistas suben sus temas y el tocadiscos los toca
--
-- 1. Cada cuenta artista puede tener su ficha en `artistas` (`perfil_id`).
--    Las fichas ficticias y las de la carga inicial no tienen cuenta: las
--    maneja el admin.
-- 2. Tabla `canciones`: solo la información del tema. El archivo va en
--    Storage, en el bucket privado `musica` (regla de CLAUDE.md, 2026-10-15).
-- 3. Bucket `musica`, privado. Nadie lo lee directo: la página pide un link
--    firmado que vence (src/app/api/canciones/[id]/audio/route.js).
-- =============================================================================


-- --- Quién puede subir música ------------------------------------------------

create function privado.es_artista()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = (select auth.uid()) and rol in ('artista', 'admin')
  );
$$;


-- --- 1. Ficha de artista ↔ cuenta --------------------------------------------

alter table public.artistas
  add column perfil_id uuid unique references public.perfiles (id) on delete set null;

comment on column public.artistas.perfil_id is
  'Cuenta artista dueña de la ficha. Null: ficha manejada por el admin.';

-- La ficha `id_artista` es de quien está mirando. Va después de la columna:
-- una función `sql` se valida al crearla.
create function privado.es_mi_ficha(id_artista bigint)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.artistas
    where id = id_artista and perfil_id = (select auth.uid())
  );
$$;

-- Crea o actualiza la ficha propia. El artista no tiene permiso de escribir
-- `artistas` (podría tocar fichas ajenas o el slug), así que pasa por acá,
-- igual que `elegir_ser_artista`. El slug se arma una sola vez, al crearla:
-- cambiarlo rompería los links.
create function public.guardar_mi_ficha(p_nombre text, p_genero text, p_bio text)
returns text
language plpgsql
security definer set search_path = ''
as $$
declare
  base text;
  nuevo_slug text;
  n int := 1;
  slug_actual text;
begin
  if (select auth.uid()) is null then
    raise exception 'Hace falta iniciar sesión.' using errcode = '42501';
  end if;
  if not privado.es_artista() then
    raise exception 'Solo las cuentas de artista tienen ficha.' using errcode = '42501';
  end if;

  p_nombre := trim(coalesce(p_nombre, ''));
  p_genero := trim(coalesce(p_genero, ''));
  p_bio := trim(coalesce(p_bio, ''));
  if char_length(p_nombre) not between 1 and 60
     or char_length(p_genero) not between 1 and 40
     or char_length(p_bio) > 600 then
    raise exception 'Revisá los largos: nombre hasta 60, género hasta 40, bio hasta 600.'
      using errcode = '22023';
  end if;

  select slug into slug_actual from public.artistas where perfil_id = (select auth.uid());

  if slug_actual is not null then
    update public.artistas
    set nombre = p_nombre, genero = p_genero, bio = p_bio
    where perfil_id = (select auth.uid());
    return slug_actual;
  end if;

  -- "Nena Tornado" → "nena-tornado"; si ya existe, "nena-tornado-2".
  base := trim(both '-' from regexp_replace(
    lower(translate(p_nombre, 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN')),
    '[^a-z0-9]+', '-', 'g'));
  if base = '' then base := 'artista'; end if;
  nuevo_slug := base;
  while exists (select 1 from public.artistas where slug = nuevo_slug) loop
    n := n + 1;
    nuevo_slug := base || '-' || n;
  end loop;

  insert into public.artistas (slug, nombre, genero, bio, perfil_id)
  values (nuevo_slug, p_nombre, p_genero, p_bio, (select auth.uid()));
  return nuevo_slug;
end;
$$;

revoke execute on function public.guardar_mi_ficha(text, text, text) from public, anon;
grant execute on function public.guardar_mi_ficha(text, text, text) to authenticated;


-- --- 2. Canciones ------------------------------------------------------------

create table public.canciones (
  id bigint generated always as identity primary key,
  slug text not null unique,
  titulo text not null check (char_length(titulo) between 1 and 120),
  artista_id bigint not null references public.artistas (id) on delete cascade,
  genero text not null default '' check (char_length(genero) <= 40),
  duracion_seg integer not null check (duracion_seg between 1 and 3600),
  -- Ruta dentro del bucket `musica`: `<id de la cuenta>/<archivo>`, o
  -- `semilla/<archivo>` para la carga inicial.
  archivo text not null unique,
  portada text not null default 'from-sky-500 via-blue-700 to-indigo-900',
  publicada boolean not null default true,
  subida_por uuid references public.perfiles (id) on delete set null,
  creada_en timestamptz not null default now()
);

comment on table public.canciones is
  'Temas que suenan en el tocadiscos. El audio está en Storage (bucket musica), no acá.';

create index canciones_artista_idx on public.canciones (artista_id);
create index canciones_creada_idx on public.canciones (creada_en desc);

-- Lo que el artista no puede elegir: a nombre de quién queda y en qué
-- carpeta está el archivo. Sin usuario logueado es una carga interna (el
-- script de la carga inicial, con la clave secreta): no se aplica.
create function privado.antes_de_guardar_cancion()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and not privado.es_admin() then
    if tg_op = 'INSERT' then
      new.subida_por := (select auth.uid());
      if new.archivo not like (select auth.uid())::text || '/%' then
        raise exception 'El archivo tiene que estar en tu carpeta.' using errcode = '42501';
      end if;
    else
      new.subida_por := old.subida_por;
      new.archivo := old.archivo;
      new.artista_id := old.artista_id;
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function privado.antes_de_guardar_cancion() from public, anon, authenticated;

create trigger antes_de_guardar_cancion
  before insert or update on public.canciones
  for each row execute function privado.antes_de_guardar_cancion();

alter table public.canciones enable row level security;

create policy "ver canciones"
  on public.canciones for select
  using (
    publicada
    or (select privado.es_mi_ficha(artista_id))
    or (select privado.es_admin())
  );

create policy "artistas suben canciones"
  on public.canciones for insert to authenticated
  with check (
    ((select privado.es_artista()) and (select privado.es_mi_ficha(artista_id)))
    or (select privado.es_admin())
  );

create policy "editar canciones propias"
  on public.canciones for update to authenticated
  using ((select privado.es_mi_ficha(artista_id)) or (select privado.es_admin()))
  with check ((select privado.es_mi_ficha(artista_id)) or (select privado.es_admin()));

create policy "borrar canciones propias"
  on public.canciones for delete to authenticated
  using ((select privado.es_mi_ficha(artista_id)) or (select privado.es_admin()));


-- --- 3. Bucket privado `musica` ----------------------------------------------

-- Hasta 25 MB (un tema de 6 minutos en MP3 a 320 kbps pesa unos 15 MB).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('musica', 'musica', false, 26214400, array['audio/mpeg', 'audio/mp4', 'audio/x-m4a']);

-- Subir: artistas y admin, siempre en una carpeta con su id.
create policy "artistas suben musica"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'musica'
    and (select privado.es_artista())
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Ver: cada artista sus archivos (Storage lo pide para poder borrarlos); el
-- admin, todos. Los visitantes no: escuchan con un link firmado.
create policy "ver musica propia"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'musica'
    and (
      ((storage.foldername(name))[1] = (select auth.uid())::text and (select privado.es_artista()))
      or (select privado.es_admin())
    )
  );

create policy "borrar musica propia"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'musica'
    and (
      ((storage.foldername(name))[1] = (select auth.uid())::text and (select privado.es_artista()))
      or (select privado.es_admin())
    )
  );
