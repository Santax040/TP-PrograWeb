import { NextResponse } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/**
 * Vuelta del login con Google.
 *
 * Supabase manda al usuario acá con un código de un solo uso. Lo canjeamos
 * por una sesión (eso deja las cookies de login) y lo llevamos a donde
 * quería ir. Si canceló en Google o el código no sirve, vuelve al login con
 * un aviso.
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const siguiente = searchParams.get("siguiente");

  // Solo rutas internas, para que nadie arme un link que redirija a otro sitio.
  const destino =
    siguiente?.startsWith("/") && !siguiente.startsWith("//") ? siguiente : "/";

  if (searchParams.get("error")) {
    return NextResponse.redirect(`${origin}/login?aviso=cancelado`);
  }

  if (code) {
    const supabase = await crearClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${destino}`);
  }

  return NextResponse.redirect(`${origin}/login?aviso=link-invalido`);
}
