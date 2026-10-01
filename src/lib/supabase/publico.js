import { createClient } from "@supabase/supabase-js";

/**
 * Cliente para leer el contenido público (notas, artistas, eventos).
 *
 * No usa cookies a propósito: así las páginas siguen pudiendo generarse de
 * antemano y servirse rápido. Consulta como un visitante sin login, por lo que
 * los permisos de la base solo le dejan ver lo publicado.
 */
export const supabasePublico = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
