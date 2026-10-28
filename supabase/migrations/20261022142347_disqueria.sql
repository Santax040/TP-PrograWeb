-- =============================================================================
-- Disquería: los artistas venden sus temas y cobran en su Mercado Pago
--
-- 1. Declaración de derechos: para subir o vender, el artista declara que la
--    música es suya o que tiene los derechos (`perfiles.derechos_aceptados_en`).
-- 2. Precio en `canciones`: null no se vende, 0 es gratis, y si no, entre
--    $100 y $1.000.000. Con `paga_lo_que_quieras`, el precio es el mínimo.
-- 3. Cuentas de Mercado Pago de los artistas (marketplace): los tokens van en
--    `privado.cuentas_mp`, que solo toca el servidor con la clave secreta.
-- 4. `compras`: una por usuario y tema. Lo comprado se conserva aunque el
--    artista borre el tema (se retira, no se borra) o deje de ser artista.
--
-- Sin comisión: la revista no se queda con nada de la venta.
-- =============================================================================


-- --- 1. Declaración de derechos ----------------------------------------------

alter table public.perfiles add column derechos_aceptados_en timestamptz;

comment on column public.perfiles.derechos_aceptados_en is
  'Cuándo declaró que la música que sube es suya o tiene los derechos. Null: todavía no.';

-- El usuario solo puede escribir `nombre` (grant por columna del esquema
-- inicial), así que esta columna pasa por las funciones de abajo.

create function privado.acepto_derechos()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = (select auth.uid())
      and (derechos_aceptados_en is not null or rol = 'admin')
  );
$$;

-- Para los artistas que ya existían antes de la declaración.
create function public.aceptar_derechos()
returns timestamptz
language plpgsql
security definer set search_path = ''
as $$
declare
  fecha timestamptz;
begin
  if (select auth.uid()) is null then
    raise exception 'Hace falta iniciar sesión.' using errcode = '42501';
  end if;

  update public.perfiles
  set derechos_aceptados_en = coalesce(derechos_aceptados_en, now())
  where id = (select auth.uid())
  returning derechos_aceptados_en into fecha;
  return fecha;
end;
$$;

revoke execute on function public.aceptar_derechos() from public, anon;
grant execute on function public.aceptar_derechos() to authenticated;

-- Pasarse a artista ahora exige la declaración. Cambia la firma: se borra la
-- vieja y se crea de nuevo, con sus permisos.
drop function public.elegir_ser_artista(boolean);

create function public.elegir_ser_artista(quiero boolean, acepto_derechos boolean default false)
returns public.rol_usuario
language plpgsql
security definer set search_path = ''
as $$
declare
  actual public.rol_usuario;
  ya_acepto boolean;
  nuevo public.rol_usuario := case when quiero then 'artista' else 'usuario' end;
begin
  if (select auth.uid()) is null then
    raise exception 'Hace falta iniciar sesión.' using errcode = '42501';
  end if;

  select rol, derechos_aceptados_en is not null into actual, ya_acepto
  from public.perfiles where id = (select auth.uid());

  if actual not in ('usuario', 'artista') then
    raise exception 'Solo las cuentas de usuario o artista pueden cambiar esto.'
      using errcode = '42501';
  end if;

  if quiero and not (ya_acepto or acepto_derechos) then
    raise exception 'Para ser artista hay que aceptar la declaración de derechos.'
      using errcode = '42501';
  end if;

  update public.perfiles
  set rol = nuevo,
      derechos_aceptados_en = case
        when quiero then coalesce(derechos_aceptados_en, now())
        else derechos_aceptados_en
      end
  where id = (select auth.uid());

  -- El que vuelve a usuario deja de vender (sus temas siguen sonando) y se
  -- borra su conexión con Mercado Pago. Lo ya vendido sigue en `compras`.
  if not quiero then
    update public.artistas set puede_vender = false where perfil_id = (select auth.uid());
    delete from privado.cuentas_mp where perfil_id = (select auth.uid());
  end if;

  return nuevo;
end;
$$;

revoke execute on function public.elegir_ser_artista(boolean, boolean) from public, anon;
grant execute on function public.elegir_ser_artista(boolean, boolean) to authenticated;


-- --- 2. Precio, ventas y temas retirados -------------------------------------

alter table public.canciones
  add column precio integer
    check (precio is null or precio = 0 or precio between 100 and 1000000),
  add column paga_lo_que_quieras boolean not null default false,
  add column ventas integer not null default 0 check (ventas >= 0),
  add column retirada_en timestamptz,
  add constraint paga_lo_que_quieras_con_precio
    check (not paga_lo_que_quieras or precio is not null);

comment on column public.canciones.precio is
  'En pesos. Null: no se vende. 0: gratis. Con paga_lo_que_quieras, es el mínimo.';
comment on column public.canciones.ventas is
  'Compras acreditadas (pagas y gratis). Lo sube solo acreditar_compra / obtener_gratis.';
comment on column public.canciones.retirada_en is
  'El artista lo borró pero ya estaba vendido: queda oculto y el archivo no se borra.';

-- ¿La ficha puede vender? Solo la escribe el servidor (al conectar o
-- desconectar Mercado Pago). El artista no tiene permiso de escribir
-- `artistas` (va por guardar_mi_ficha, que no toca esta columna).
alter table public.artistas add column puede_vender boolean not null default false;

comment on column public.artistas.puede_vender is
  'Tiene una cuenta de Mercado Pago conectada. La escriben solo guardar_cuenta_mp / borrar_cuenta_mp.';

-- Lo que el artista no puede elegir. Pasa a "security invoker" para
-- distinguir quién escribe: `current_user` es `authenticated` cuando el cambio
-- viene de la página, y el dueño de la función cuando lo hace una función
-- de la base (acreditar_compra, retirar_cancion) o la clave secreta (script).
create or replace function privado.antes_de_guardar_cancion()
returns trigger
language plpgsql
security invoker set search_path = ''
as $$
begin
  if current_user = 'authenticated' and not privado.es_admin() then
    if tg_op = 'INSERT' then
      new.subida_por := (select auth.uid());
      new.ventas := 0;
      new.retirada_en := null;
      if new.archivo not like (select auth.uid())::text || '/%' then
        raise exception 'El archivo tiene que estar en tu carpeta.' using errcode = '42501';
      end if;
    else
      new.subida_por := old.subida_por;
      new.archivo := old.archivo;
      new.artista_id := old.artista_id;
      new.ventas := old.ventas;
      new.retirada_en := old.retirada_en;
      -- Un tema retirado no vuelve a mostrarse.
      if old.retirada_en is not null then
        new.publicada := false;
      end if;
    end if;
  end if;
  return new;
end;
$$;

-- Subir temas exige la declaración (el admin queda exento).
drop policy "artistas suben canciones" on public.canciones;
create policy "artistas suben canciones"
  on public.canciones for insert to authenticated
  with check (
    (
      (select privado.es_artista())
      and (select privado.acepto_derechos())
      and (select privado.es_mi_ficha(artista_id))
    )
    or (select privado.es_admin())
  );

drop policy "artistas suben musica" on storage.objects;
create policy "artistas suben musica"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'musica'
    and (select privado.es_artista())
    and (select privado.acepto_derechos())
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );


-- --- 3. Cuentas de Mercado Pago ----------------------------------------------

-- En `privado`, que la API no expone. Sin permisos para nadie de la web: solo
-- las funciones de abajo, que solo puede llamar el servidor.
create table privado.cuentas_mp (
  perfil_id uuid primary key references public.perfiles (id) on delete cascade,
  mp_user_id bigint not null,
  access_token text not null,
  refresh_token text not null,
  public_key text,
  expira_en timestamptz not null,
  conectada_en timestamptz not null default now()
);

comment on table privado.cuentas_mp is
  'Credenciales OAuth de Mercado Pago de cada artista. Secretas: solo el servidor.';

alter table privado.cuentas_mp enable row level security;
revoke all on privado.cuentas_mp from public, anon, authenticated;

-- Guarda (o renueva) la cuenta y habilita la venta en la ficha. Valida que
-- sea una cuenta artista con ficha y con la declaración aceptada.
create function public.guardar_cuenta_mp(
  p_perfil_id uuid,
  p_mp_user_id bigint,
  p_access_token text,
  p_refresh_token text,
  p_public_key text,
  p_expira_en timestamptz
)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.perfiles
    where id = p_perfil_id
      and (rol = 'admin' or (rol = 'artista' and derechos_aceptados_en is not null))
  ) then
    raise exception 'La cuenta no es de artista o no aceptó la declaración.' using errcode = '42501';
  end if;
  if not exists (select 1 from public.artistas where perfil_id = p_perfil_id) then
    raise exception 'Primero hay que armar la ficha de artista.' using errcode = '42501';
  end if;

  insert into privado.cuentas_mp (perfil_id, mp_user_id, access_token, refresh_token, public_key, expira_en)
  values (p_perfil_id, p_mp_user_id, p_access_token, p_refresh_token, p_public_key, p_expira_en)
  on conflict (perfil_id) do update
  set mp_user_id = excluded.mp_user_id,
      access_token = excluded.access_token,
      refresh_token = excluded.refresh_token,
      public_key = excluded.public_key,
      expira_en = excluded.expira_en;

  update public.artistas set puede_vender = true where perfil_id = p_perfil_id;
end;
$$;

create function public.leer_cuenta_mp(p_perfil_id uuid)
returns table (
  mp_user_id bigint,
  access_token text,
  refresh_token text,
  public_key text,
  expira_en timestamptz
)
language sql
stable
security definer set search_path = ''
as $$
  select mp_user_id, access_token, refresh_token, public_key, expira_en
  from privado.cuentas_mp where perfil_id = p_perfil_id;
$$;

create function public.borrar_cuenta_mp(p_perfil_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  delete from privado.cuentas_mp where perfil_id = p_perfil_id;
  update public.artistas set puede_vender = false where perfil_id = p_perfil_id;
end;
$$;

revoke execute on function public.guardar_cuenta_mp(uuid, bigint, text, text, text, timestamptz)
  from public, anon, authenticated;
revoke execute on function public.leer_cuenta_mp(uuid) from public, anon, authenticated;
revoke execute on function public.borrar_cuenta_mp(uuid) from public, anon, authenticated;
grant execute on function public.guardar_cuenta_mp(uuid, bigint, text, text, text, timestamptz)
  to service_role;
grant execute on function public.leer_cuenta_mp(uuid) to service_role;
grant execute on function public.borrar_cuenta_mp(uuid) to service_role;


-- --- 4. Compras --------------------------------------------------------------

create table public.compras (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  -- `restrict`: un tema vendido no se borra (se retira). Así el comprador
  -- siempre lo puede bajar.
  cancion_id bigint not null references public.canciones (id) on delete restrict,
  monto numeric(12, 2) not null check (monto >= 0),
  -- ID del pago en la cuenta de Mercado Pago del artista. Null en las gratis.
  mp_pago_id bigint unique,
  creada_en timestamptz not null default now(),
  unique (usuario_id, cancion_id)
);

comment on table public.compras is
  'Temas que tiene cada usuario. Una por usuario y tema; las gratis van con monto 0.';

create index compras_cancion_idx on public.compras (cancion_id);

-- Cada uno ve sus compras; nadie escribe desde la web (solo las funciones).
alter table public.compras enable row level security;
revoke insert, update, delete on public.compras from anon, authenticated;

create policy "cada uno ve sus compras" on public.compras
  for select to authenticated
  using (usuario_id = (select auth.uid()) or (select privado.es_admin()));

-- Acreditar una compra paga. La llama solo el servidor, después de confirmar
-- con Mercado Pago (en la cuenta del artista) que el pago está aprobado.
-- Se puede llamar varias veces con el mismo pago: acredita una sola vez.
-- Devuelve true si la compra quedó registrada (ahora o antes).
create function public.acreditar_compra(
  p_pago_id bigint,
  p_usuario_id uuid,
  p_cancion_id bigint,
  p_monto numeric
)
returns boolean
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.compras (usuario_id, cancion_id, monto, mp_pago_id)
  values (p_usuario_id, p_cancion_id, p_monto, p_pago_id)
  on conflict do nothing;

  if found then
    update public.canciones set ventas = ventas + 1 where id = p_cancion_id;
  end if;

  return exists (
    select 1 from public.compras where usuario_id = p_usuario_id and cancion_id = p_cancion_id
  );
end;
$$;

revoke execute on function public.acreditar_compra(bigint, uuid, bigint, numeric)
  from public, anon, authenticated;
grant execute on function public.acreditar_compra(bigint, uuid, bigint, numeric) to service_role;

-- Bajar un tema gratis (precio 0, o "pagá lo que quieras" con mínimo 0).
create function public.obtener_gratis(p_cancion_id bigint)
returns boolean
language plpgsql
security definer set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Hace falta iniciar sesión.' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.canciones
    where id = p_cancion_id and precio = 0 and publicada and retirada_en is null
  ) then
    raise exception 'Ese tema no es gratis.' using errcode = '42501';
  end if;

  insert into public.compras (usuario_id, cancion_id, monto)
  values ((select auth.uid()), p_cancion_id, 0)
  on conflict do nothing;

  if found then
    update public.canciones set ventas = ventas + 1 where id = p_cancion_id;
  end if;
  return true;
end;
$$;

revoke execute on function public.obtener_gratis(bigint) from public, anon;
grant execute on function public.obtener_gratis(bigint) to authenticated;

-- Ventas del artista por tema: cuántas y cuánto. Sin datos de quién compró.
create function public.mis_ventas()
returns table (cancion_id bigint, cantidad bigint, total numeric)
language sql
stable
security definer set search_path = ''
as $$
  select c.cancion_id, count(*), coalesce(sum(c.monto), 0)
  from public.compras c
  join public.canciones t on t.id = c.cancion_id
  join public.artistas a on a.id = t.artista_id
  where a.perfil_id = (select auth.uid())
  group by c.cancion_id;
$$;

revoke execute on function public.mis_ventas() from public, anon;
grant execute on function public.mis_ventas() to authenticated;

-- Borrar un tema ya vendido: se retira (oculto, el archivo queda para los
-- compradores). El trigger no deja que el artista escriba `retirada_en`
-- directo; esta función sí, después de validar que el tema es suyo.
create function public.retirar_cancion(p_cancion_id bigint)
returns boolean
language plpgsql
security definer set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Hace falta iniciar sesión.' using errcode = '42501';
  end if;
  if not (
    exists (
      select 1 from public.canciones t
      join public.artistas a on a.id = t.artista_id
      where t.id = p_cancion_id and a.perfil_id = (select auth.uid())
    )
    or privado.es_admin()
  ) then
    raise exception 'Ese tema no es tuyo.' using errcode = '42501';
  end if;

  update public.canciones
  set publicada = false, retirada_en = coalesce(retirada_en, now())
  where id = p_cancion_id;
  return true;
end;
$$;

revoke execute on function public.retirar_cancion(bigint) from public, anon;
grant execute on function public.retirar_cancion(bigint) to authenticated;
