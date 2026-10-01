-- =============================================================================
-- Ajustes marcados por el chequeo de seguridad de Supabase (`db advisors`)
--
-- 1. Las funciones auxiliares (es_admin, triggers) estaban en el esquema
--    `public`, que Supabase publica como API: cualquiera podía llamarlas por
--    /rest/v1/rpc/... No daban acceso a nada, pero no tienen por qué estar
--    expuestas. Se mueven a un esquema `privado` que la API no publica.
-- 2. Las políticas "solo admin" eran FOR ALL, que incluye SELECT, y se
--    sumaban a "lectura publica": dos políticas evaluándose en cada lectura.
--    Se separan en insert/update/delete.
-- =============================================================================

create schema privado;

-- Los roles de la API necesitan poder usar el esquema para evaluar las
-- políticas, pero al no estar publicado no se puede llamar desde afuera.
grant usage on schema privado to anon, authenticated;

alter function public.es_admin() set schema privado;
alter function public.es_suscriptor() set schema privado;
alter function public.crear_perfil() set schema privado;
alter function public.antes_de_guardar_articulo() set schema privado;

-- Los triggers no necesitan que nadie tenga permiso de ejecutar sus funciones.
revoke execute on function privado.crear_perfil() from public, anon, authenticated;
revoke execute on function privado.antes_de_guardar_articulo() from public, anon, authenticated;

-- Este trigger llamaba a public.es_admin() por nombre: se actualiza.
create or replace function privado.antes_de_guardar_articulo()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  new.actualizado_en := now();

  -- Sin usuario logueado es una carga interna (migraciones, consola de
  -- Supabase): no se aplican estas reglas. Desde la web anon no puede escribir.
  if (select auth.uid()) is not null and not privado.es_admin() then
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


-- --- Políticas de admin separadas por acción ---------------------------------

do $$
declare
  tabla text;
begin
  foreach tabla in array array['categorias', 'artistas', 'eventos', 'evento_artistas'] loop
    execute format('drop policy "solo admin" on public.%I', tabla);
    execute format(
      'create policy "admin crea" on public.%I for insert to authenticated
         with check ((select privado.es_admin()))', tabla);
    execute format(
      'create policy "admin edita" on public.%I for update to authenticated
         using ((select privado.es_admin())) with check ((select privado.es_admin()))', tabla);
    execute format(
      'create policy "admin borra" on public.%I for delete to authenticated
         using ((select privado.es_admin()))', tabla);
  end loop;
end $$;

-- Lo mismo para los artistas de cada nota.
drop policy "editar artistas de notas propias" on public.articulo_artistas;

create function privado.puede_editar_articulo(id_articulo bigint)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.articulos a
    where a.id = id_articulo
      and (a.autor_id = (select auth.uid()) or privado.es_admin())
  );
$$;

create policy "agregar artistas a notas propias"
  on public.articulo_artistas for insert to authenticated
  with check (privado.puede_editar_articulo(articulo_id));

create policy "quitar artistas de notas propias"
  on public.articulo_artistas for delete to authenticated
  using (privado.puede_editar_articulo(articulo_id));
