-- =============================================================================
-- Notas exclusivas protegidas en la base, y negar por defecto
--
-- Corrección del profesor (2026-10-25): las notas premium se ocultaban en la
-- página, pero la política "ver notas" deja leer el `cuerpo` de toda nota
-- publicada, y la clave pública viaja en el navegador. Cualquiera las leía
-- completas pidiéndolas directo a la API.
--
-- 1. El texto completo de las notas exclusivas pasa a `articulos_premium`,
--    que solo se lee con sesión y suscripción vigente (o siendo el autor o
--    el admin). En `articulos` queda solo el adelanto: el primer párrafo
--    (nada si la nota tiene uno solo). Lo asegura el trigger, no la página.
-- 2. Negar por defecto: Supabase le da a `anon` permisos sobre toda tabla de
--    `public` y lo único que lo frenaba era RLS. En las tablas privadas se
--    sacan los permisos que nadie de la web tiene que usar.
-- =============================================================================


-- --- 1. Texto completo de las notas exclusivas -------------------------------

create table public.articulos_premium (
  articulo_id bigint primary key references public.articulos (id) on delete cascade,
  cuerpo text[] not null default '{}'
);

comment on table public.articulos_premium is
  'Texto completo de las notas exclusivas. Lo leen suscriptores vigentes, el autor y el admin. En articulos.cuerpo queda solo el adelanto.';

alter table public.articulos_premium enable row level security;

-- Nada para visitantes; los usuarios, solo lo que dejen las políticas.
revoke all on public.articulos_premium from anon, authenticated;
grant select, insert, update, delete on public.articulos_premium to authenticated;

-- Leer: suscriptor vigente y nota exclusiva publicada (un borrador no se lee
-- aunque se pague), o quien puede editar la nota (su autor publicador o el admin).
create policy "suscriptores leen notas exclusivas"
  on public.articulos_premium for select to authenticated
  using (
    (select privado.puede_editar_articulo(articulo_id))
    or (
      (select privado.es_suscriptor())
      and exists (
        select 1 from public.articulos a
        where a.id = articulo_id and a.estado = 'publicada' and a.premium
      )
    )
  );

-- Escribir: lo mismo que editar la nota.
create policy "autores escriben el texto exclusivo"
  on public.articulos_premium for insert to authenticated
  with check ((select privado.puede_editar_articulo(articulo_id)));

create policy "autores editan el texto exclusivo"
  on public.articulos_premium for update to authenticated
  using ((select privado.puede_editar_articulo(articulo_id)))
  with check ((select privado.puede_editar_articulo(articulo_id)));

create policy "autores borran el texto exclusivo"
  on public.articulos_premium for delete to authenticated
  using ((select privado.puede_editar_articulo(articulo_id)));

-- Las notas exclusivas que ya existen: el texto completo se copia antes de
-- que el trigger de abajo recorte `articulos.cuerpo`.
insert into public.articulos_premium (articulo_id, cuerpo)
select id, cuerpo from public.articulos where premium;

-- En una nota exclusiva, `articulos.cuerpo` (que lee cualquiera) guarda solo
-- el adelanto. Vale para todos, admin y cargas internas incluidas: así
-- ningún camino deja el texto completo a la vista.
create or replace function privado.antes_de_guardar_articulo()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  new.actualizado_en := now();

  -- El adelanto es el primer párrafo, y solo si hay más: en una nota de un
  -- párrafo, el adelanto sería la nota entera.
  if new.premium then
    new.cuerpo := case when cardinality(new.cuerpo) > 1 then new.cuerpo[1:1] else '{}' end;
  end if;

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

-- Recorta las que ya existen (el trigger hace el recorte).
update public.articulos set cuerpo = cuerpo where premium;


-- --- 2. Negar por defecto ----------------------------------------------------

-- Los visitantes no tienen nada que hacer acá, ni siquiera con RLS.
revoke all on public.perfiles, public.pagos, public.compras, public.envios from anon;

-- Los usuarios solo leen lo suyo (RLS). Pagos y compras los escribe solo el
-- servidor (acreditar_pago, acreditar_compra, obtener_gratis); el perfil lo
-- crea el trigger y del perfil el usuario solo edita `nombre` (grant por
-- columna del esquema inicial, que sigue vigente).
revoke insert, update, delete, truncate on public.pagos, public.compras from authenticated;
revoke insert, delete, truncate on public.perfiles from authenticated;
revoke truncate on public.envios from authenticated;
