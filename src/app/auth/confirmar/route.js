import { NextResponse } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/**
 * Destino del link que llega por mail al registrarse.
 *
 * Supabase manda al usuario acá con un código de un solo uso. Lo canjeamos por
 * una sesión (eso deja la cuenta confirmada y logueada) y lo llevamos al
 * inicio. Si el código no sirve, lo mandamos al login con un aviso.
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = await crearClienteServidor();

  let error = new Error("Link incompleto");
  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
  }

  if (error) {
    return NextResponse.redirect(`${origin}/login?aviso=link-invalido`);
  }
  return NextResponse.redirect(`${origin}/`);
}
