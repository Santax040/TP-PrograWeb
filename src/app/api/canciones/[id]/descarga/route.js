import { NextResponse } from "next/server";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { obtenerSesion } from "@/lib/sesion";

/** Alcanza para que arranque la descarga: el link no se guarda en ningún lado. */
const SEGUNDOS_DEL_LINK = 5 * 60;

/**
 * Bajar un tema: solo quien lo compró (o lo obtuvo gratis), su artista o el
 * admin. Redirige a un link firmado que el navegador baja como archivo.
 *
 * El tema se busca con la clave secreta, porque lo comprado se conserva: la
 * base ya no le muestra a su comprador un tema oculto o retirado. La compra sí
 * se busca con la sesión, y cada uno solo ve las suyas.
 */
export async function GET(request, { params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return responder("No existe esa canción.", 404);

  const { supabase, user, perfil } = await obtenerSesion();
  if (!user) {
    const respuesta = NextResponse.redirect(new URL("/login?siguiente=/compras", request.url), 303);
    respuesta.headers.set("Cache-Control", "no-store");
    return respuesta;
  }

  const admin = crearClienteAdmin();
  const { data: cancion } = await admin
    .from("canciones")
    .select("titulo, archivo, artistas ( nombre, perfil_id )")
    .eq("id", id)
    .maybeSingle();
  if (!cancion) return responder("No existe esa canción.", 404);

  const { data: compra } = await supabase
    .from("compras")
    .select("id")
    .eq("cancion_id", id)
    .eq("usuario_id", user.id)
    .maybeSingle();
  const esSuya = cancion.artistas?.perfil_id === user.id;
  if (!compra && !esSuya && perfil?.rol !== "admin") {
    return responder("Para bajar este tema, primero hay que comprarlo.", 403);
  }

  const { data, error } = await admin.storage
    .from("musica")
    .createSignedUrl(cancion.archivo, SEGUNDOS_DEL_LINK, { download: nombreDeArchivo(cancion) });

  if (error || !data?.signedUrl) {
    console.error("No se pudo firmar la descarga", cancion.archivo, error);
    return responder("No se pudo bajar el tema. Probá de nuevo.", 502);
  }

  const respuesta = NextResponse.redirect(data.signedUrl, 302);
  respuesta.headers.set("Cache-Control", "no-store");
  return respuesta;
}

/**
 * "Artista - Tema.mp3", sin los caracteres que Windows no acepta en un nombre
 * y sin acentos: Storage codifica el nombre dos veces, y "común" bajaría como
 * "com%C3%BAn".
 */
function nombreDeArchivo({ titulo, archivo, artistas }) {
  const extension = archivo.split(".").pop();
  const nombre = `${artistas?.nombre ?? ""} - ${titulo}`
    .normalize("NFD")
    .replace(/[^\x20-\x7e]|[\\/:*?"<>|]/g, "")
    .trim();
  return `${/[a-z0-9]/i.test(nombre) ? nombre : "Artificial"}.${extension}`;
}

function responder(texto, status) {
  return new NextResponse(texto, { status, headers: { "Cache-Control": "no-store" } });
}
