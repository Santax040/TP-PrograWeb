import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para el servidor (Server Actions, Route Handlers y
 * componentes de servidor) que actúa en nombre del usuario logueado.
 *
 * La sesión viaja en cookies: este cliente las lee para saber quién es y las
 * escribe cuando inicia o cierra sesión. Usar `cookies()` vuelve dinámica la
 * página que lo llame, por eso el contenido público usa `supabasePublico`.
 */
export async function crearClienteServidor() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesParaGuardar) {
          try {
            cookiesParaGuardar.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Desde un componente de servidor no se pueden escribir cookies.
            // No pasa nada: el proxy ya renueva la sesión en cada request.
          }
        },
      },
    },
  );
}
