import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { oauthConfigurado, urlDeConexion } from "@/lib/mercadopago-cuentas";
import { obtenerSesion } from "@/lib/sesion";

/**
 * Botón "Conectar Mercado Pago" de /estudio: manda al artista a autorizar.
 *
 * El `state` queda en una cookie que el navegador no puede leer: a la vuelta
 * se compara, para no aceptar una cuenta ajena en la sesión de este artista.
 */
export async function GET(request) {
  const origen = new URL(request.url).origin;
  const volver = (ruta) => NextResponse.redirect(`${origen}${ruta}`, 303);

  const { supabase, user, perfil } = await obtenerSesion();
  if (!user) return volver("/login?siguiente=/estudio");
  if (perfil?.rol !== "artista" && perfil?.rol !== "admin") return volver("/configuracion");
  if (perfil.rol !== "admin" && !perfil.derechos_aceptados_en) return volver("/estudio");

  const { data: ficha } = await supabase.from("artistas").select("id").eq("perfil_id", user.id).maybeSingle();
  if (!ficha) return volver("/estudio");

  if (!oauthConfigurado()) return volver("/estudio?mp=sin-configurar");

  const state = randomBytes(24).toString("base64url");
  const respuesta = NextResponse.redirect(urlDeConexion(state, origen), 303);
  respuesta.cookies.set("mp_state", state, {
    httpOnly: true,
    secure: origen.startsWith("https://"),
    sameSite: "lax", // Tiene que viajar en la vuelta, que viene de otro sitio.
    path: "/api/mercadopago/conectar",
    maxAge: 10 * 60, // Lo que dura el código de Mercado Pago.
  });
  return respuesta;
}
