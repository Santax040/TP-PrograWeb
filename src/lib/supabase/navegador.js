import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para componentes de cliente (los que llevan
 * `"use client"`). Lee la sesión de las mismas cookies que el servidor.
 */
export function crearClienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
