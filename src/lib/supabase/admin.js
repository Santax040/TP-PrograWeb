import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con la clave secreta: se saltea los permisos (RLS).
 *
 * Solo para el servidor y solo para lo que ningún usuario puede hacer por sí
 * mismo, como acreditar un pago de Mercado Pago. Nunca importarlo desde un
 * componente con `"use client"`: la clave quedaría expuesta en el navegador.
 */
export function crearClienteAdmin() {
  const clave = process.env.SUPABASE_SECRET_KEY;
  if (!clave) {
    throw new Error("Falta SUPABASE_SECRET_KEY en las variables de entorno.");
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, clave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
