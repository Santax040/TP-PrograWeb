"use server";

import { obtenerSesion } from "@/lib/sesion";

/**
 * Anota un tema gratis en las compras de quien lo pide. La base controla que
 * de verdad sea gratis y no lo anota dos veces.
 */
export async function obtenerGratis(id) {
  const { supabase, user } = await obtenerSesion();
  if (!user) return { login: true };

  const { error } = await supabase.rpc("obtener_gratis", { p_cancion_id: id });
  if (error) return { error: "No se pudo bajar el tema. Probá de nuevo." };

  return { ok: true };
}
