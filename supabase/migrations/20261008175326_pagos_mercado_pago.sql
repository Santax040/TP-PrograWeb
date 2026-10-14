-- =============================================================================
-- Pagos de suscripción con Mercado Pago (Checkout Pro)
--
-- Cada pago aprobado extiende `perfiles.suscripcion_hasta` un mes o un año.
-- Mercado Pago avisa del mismo pago más de una vez (la vuelta del usuario a
-- /suscribite/resultado y el webhook), así que la tabla `pagos` guarda cada
-- pago una sola vez, con el ID de Mercado Pago como clave: si ya estaba, no se
-- vuelve a extender nada.
-- =============================================================================

create table public.pagos (
  id bigint primary key,                      -- ID del pago en Mercado Pago
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  plan public.plan_suscripcion not null check (plan <> 'libre'),
  monto numeric(12, 2) not null,
  acreditado_en timestamptz not null default now()
);

comment on table public.pagos is
  'Pagos aprobados de Mercado Pago ya acreditados. Uno por pago: evita extender la suscripción dos veces.';

create index pagos_usuario_id on public.pagos (usuario_id);

-- Cada uno ve sus pagos; nadie escribe desde la web (solo la función de abajo).
alter table public.pagos enable row level security;

create policy "cada uno ve sus pagos" on public.pagos
  for select to authenticated
  using (usuario_id = (select auth.uid()));


-- --- Acreditar un pago -------------------------------------------------------
-- La llama solo el servidor de la revista (con la clave secreta), después de
-- confirmar con Mercado Pago que el pago está aprobado. Devuelve la fecha de
-- `suscripcion_hasta` (si el pago ya estaba acreditado, la vigente sin tocarla).
--
-- La extensión arranca desde hoy o desde el vencimiento actual, lo que sea
-- más tarde: renovar antes de tiempo no hace perder días.
create function public.acreditar_pago(
  p_pago_id bigint,
  p_usuario_id uuid,
  p_plan public.plan_suscripcion,
  p_monto numeric
)
returns date
language plpgsql
security definer set search_path = ''
as $$
declare
  nueva_fecha date;
begin
  insert into public.pagos (id, usuario_id, plan, monto)
  values (p_pago_id, p_usuario_id, p_plan, p_monto)
  on conflict (id) do nothing;

  if not found then
    -- Ya acreditado antes (recarga de la página o webhook repetido).
    select suscripcion_hasta into nueva_fecha
    from public.perfiles where id = p_usuario_id;
    return nueva_fecha;
  end if;

  update public.perfiles
  set plan = p_plan,
      suscripcion_hasta =
        greatest(current_date, coalesce(suscripcion_hasta, current_date))
        + case when p_plan = 'anual' then interval '1 year' else interval '1 month' end
  where id = p_usuario_id
  returning suscripcion_hasta into nueva_fecha;

  return nueva_fecha;
end;
$$;

revoke execute on function public.acreditar_pago(bigint, uuid, public.plan_suscripcion, numeric)
  from public, anon, authenticated;
grant execute on function public.acreditar_pago(bigint, uuid, public.plan_suscripcion, numeric)
  to service_role;
