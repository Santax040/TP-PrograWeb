import { NextResponse } from "next/server";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/** Cuánto vale el link firmado. Alcanza para escuchar un tema entero y pausarlo un rato. */
const SEGUNDOS_DEL_LINK = 60 * 60;

/**
 * El audio de una canción. El bucket `musica` es privado: esta ruta busca el
 * tema y redirige (302) a un link firmado que vence solo. El `<audio>` sigue
 * el redirect, y adelantar o atrasar funciona porque Storage responde por
 * rangos.
 *
 * El tema se busca como quien escucha (con su sesión), así los permisos de la
 * base deciden: cualquiera escucha los publicados; el artista, también los
 * suyos ocultos. Solo el link se pide con la clave secreta, porque nadie tiene
 * permiso de leer el bucket directo.
 *
 * `no-store`: un link vencido guardado en caché dejaría el tema mudo.
 */
export async function GET(_request, { params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return noEncontrada();

  const supabase = await crearClienteServidor();
  const { data: cancion } = await supabase
    .from("canciones")
    .select("archivo")
    .eq("id", id)
    .maybeSingle();

  if (!cancion) return noEncontrada();

  const { data, error } = await crearClienteAdmin()
    .storage.from("musica")
    .createSignedUrl(cancion.archivo, SEGUNDOS_DEL_LINK);

  if (error || !data?.signedUrl) {
    console.error("No se pudo firmar el audio", cancion.archivo, error);
    return new NextResponse("No se pudo cargar el audio.", {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const respuesta = NextResponse.redirect(data.signedUrl, 302);
  respuesta.headers.set("Cache-Control", "no-store");
  return respuesta;
}

function noEncontrada() {
  return new NextResponse("No existe esa canción.", {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });
}
