-- =============================================================================
-- Un solo admin, y "ser artista" lo elige cada usuario
--
-- Roles (columna `perfiles.rol`):
--   admin       → uno solo (el dueño de la revista). Puede todo.
--   publicador  → publica notas; edita y borra solo las suyas.
--   usuario     → lee y manda propuestas.
--   artista     → como usuario; a futuro, sube música.
--
-- Suscriptor / no suscriptor NO es un rol: es `perfiles.plan`
-- (libre, mensual, anual) y vale para cualquiera.
-- =============================================================================

-- --- Un solo admin -----------------------------------------------------------
-- Índice único sobre una constante, pero solo para las filas admin: la base
-- rechaza que haya dos a la vez.
create unique index un_solo_admin on public.perfiles ((true)) where rol = 'admin';


-- --- Ser artista -------------------------------------------------------------
-- El usuario no puede tocar su `rol` (solo tiene permiso sobre `nombre`), así
-- que el cambio pasa por esta función. Solo mueve entre usuario y artista: un
-- publicador o el admin no pueden usarla (perderían sus permisos por error),
-- y nadie puede subirse a publicador o admin por acá.
--
-- Está en `public` a propósito, para poder llamarla desde la página
-- (`supabase.rpc('elegir_ser_artista', ...)`). Es "security definer" porque
-- tiene que escribir una columna que el usuario no puede escribir; por eso
-- valida todo adentro.
create function public.elegir_ser_artista(quiero boolean)
returns public.rol_usuario
language plpgsql
security definer set search_path = ''
as $$
declare
  actual public.rol_usuario;
  nuevo public.rol_usuario := case when quiero then 'artista' else 'usuario' end;
begin
  if (select auth.uid()) is null then
    raise exception 'Hace falta iniciar sesión.' using errcode = '42501';
  end if;

  select rol into actual from public.perfiles where id = (select auth.uid());

  if actual not in ('usuario', 'artista') then
    raise exception 'Solo las cuentas de usuario o artista pueden cambiar esto.'
      using errcode = '42501';
  end if;

  update public.perfiles set rol = nuevo where id = (select auth.uid());
  return nuevo;
end;
$$;

revoke execute on function public.elegir_ser_artista(boolean) from public, anon;
grant execute on function public.elegir_ser_artista(boolean) to authenticated;
