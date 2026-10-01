import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * Proxy (antes "middleware"): corre antes de cada página.
 *
 * Su único trabajo es mantener viva la sesión. El token de login dura una
 * hora; acá Supabase lo renueva si hace falta y guarda las cookies nuevas en
 * la respuesta. No decide permisos: eso lo hace la base de datos.
 */
export async function proxy(request) {
  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesParaGuardar) {
          cookiesParaGuardar.forEach(({ name, value }) => request.cookies.set(name, value));
          respuesta = NextResponse.next({ request });
          cookiesParaGuardar.forEach(({ name, value, options }) =>
            respuesta.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Valida el token y lo renueva si venció. No borrar: sin esta llamada la
  // sesión se corta al pasar la hora.
  await supabase.auth.getClaims();

  return respuesta;
}

export const config = {
  matcher: [
    // Todo menos archivos estáticos e imágenes.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
