import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { conectarCuenta } from "@/lib/mercadopago-cuentas";
import { obtenerSesion } from "@/lib/sesion";

function mismoState(a, b) {
  if (!a || !b) return false;
  const [uno, otro] = [Buffer.from(a), Buffer.from(b)];
  return uno.length === otro.length && timingSafeEqual(uno, otro);
}

/**
 * Adonde vuelve el artista después de autorizar (o no) en Mercado Pago.
 *
 * El código solo se canjea si el `state` es el de la cookie, y la cuenta queda
 * a nombre de quien tiene la sesión: nada de lo que venga en la URL decide eso.
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const estado = request.cookies.get("mp_state")?.value;

  const volver = (ruta) => {
    const respuesta = NextResponse.redirect(`${origin}${ruta}`, 303);
    respuesta.headers.set("Cache-Control", "no-store");
    respuesta.cookies.set("mp_state", "", { path: "/api/mercadopago/conectar", maxAge: 0 });
    return respuesta;
  };

  const { supabase, user } = await obtenerSesion();
  if (!user) return volver("/login?siguiente=/estudio");

  if (!mismoState(estado, searchParams.get("state"))) return volver("/estudio?mp=error");

  const code = searchParams.get("code");
  if (!code) return volver("/estudio?mp=cancelado");

  try {
    await conectarCuenta(user.id, code, origin);
  } catch (error) {
    console.error("No se pudo conectar Mercado Pago", error.message);
    return volver("/estudio?mp=error");
  }

  // Sus temas pagos ya se pueden comprar.
  const { data: ficha } = await supabase.from("artistas").select("slug").eq("perfil_id", user.id).maybeSingle();
  revalidatePath("/musica");
  if (ficha) revalidatePath(`/artistas/${ficha.slug}`);

  return volver("/estudio?mp=ok");
}
