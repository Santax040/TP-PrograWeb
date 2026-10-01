-- =============================================================================
-- Perfil cargado desde Google
--
-- El login pasa a ser solo con Google (OAuth). Google le entrega a Supabase el
-- nombre y la foto de la cuenta en `raw_user_meta_data`, con otras claves que
-- las que mandaba nuestro formulario (`full_name`/`name` en vez de `nombre`).
-- =============================================================================

alter table public.perfiles add column avatar_url text;

comment on column public.perfiles.avatar_url is
  'Foto de la cuenta de Google. La toma el trigger al crear el perfil.';

-- Al crear el usuario: nombre y foto desde Google. `nombre` se mantiene para
-- las cuentas creadas con el formulario anterior.
create or replace function privado.crear_perfil()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  datos jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.perfiles (id, nombre, avatar_url)
  values (
    new.id,
    left(coalesce(
      nullif(trim(datos ->> 'nombre'), ''),
      nullif(trim(datos ->> 'full_name'), ''),
      nullif(trim(datos ->> 'name'), ''),
      split_part(new.email, '@', 1)
    ), 60),
    nullif(datos ->> 'avatar_url', '')
  );
  return new;
end;
$$;

-- Si alguien que ya tenía cuenta con mail entra con Google (mismo mail),
-- Supabase le agrega esa "identidad" a su usuario en vez de crear uno nuevo.
-- El trigger de arriba no corre, así que la foto se completa acá.
create function privado.completar_avatar()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.perfiles
  set avatar_url = new.identity_data ->> 'avatar_url'
  where id = new.user_id
    and avatar_url is null
    and new.identity_data ->> 'avatar_url' is not null;
  return new;
end;
$$;

revoke execute on function privado.completar_avatar() from public, anon, authenticated;

create trigger al_vincular_identidad
  after insert on auth.identities
  for each row execute function privado.completar_avatar();
