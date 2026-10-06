import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/**
 * Quién está mirando, para páginas y Server Actions del servidor.
 *
 * Devuelve el cliente de Supabase (que actúa como ese usuario), el usuario de
 * Auth y su perfil (nombre, rol, foto). Sin sesión, `user` y `perfil` son null.
 */
export async function obtenerSesion() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, perfil: null };

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("nombre, rol, plan, suscripcion_hasta, creado_en, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, perfil };
}

/** Publicadores y admins pueden escribir en la revista. */
export function puedeEscribir(perfil) {
  return perfil?.rol === "publicador" || perfil?.rol === "admin";
}

/**
 * Para las páginas de Redacción: sin sesión, al login (y de vuelta acá);
 * con sesión pero sin permiso de escribir, a la página de propuestas.
 *
 * Es solo para no mostrarle la pantalla a quien no corresponde: lo que
 * protege los datos de verdad son los permisos de la base.
 */
export async function exigirRedaccion(volverA) {
  const sesion = await obtenerSesion();
  if (!sesion.user) redirect(`/login?siguiente=${encodeURIComponent(volverA)}`);
  if (!puedeEscribir(sesion.perfil)) redirect("/colabora");
  return sesion;
}
