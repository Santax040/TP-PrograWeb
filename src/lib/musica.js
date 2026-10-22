/**
 * Canciones: los temas que suenan en el tocadiscos y en las fichas de artista.
 *
 * En la base va solo la información del tema; el audio está en el bucket
 * privado `musica` y se escucha por `rutaDeAudio(id)` (src/lib/audio.js), que
 * da un link firmado.
 *
 * Se consulta como visitante (`supabasePublico`): solo vuelven las publicadas.
 */

import { formatearDuracion } from "@/lib/formato";
import { supabasePublico as db } from "@/lib/supabase/publico";

/**
 * La misma forma que usa el tocadiscos, más el `id` para pedir el audio.
 *
 * @typedef {Object} Cancion
 * @property {number} id
 * @property {string} slug
 * @property {string} tema
 * @property {string} artista - Nombre que se muestra.
 * @property {string} artistaSlug
 * @property {string} duracion - "m:ss".
 * @property {number} duracionSeg - Para la línea de tiempo antes de que cargue el audio.
 * @property {string} genero - El del tema o, si no tiene, el del artista.
 * @property {string} portada - Clases de Tailwind del gradiente de la etiqueta.
 */

const COLUMNAS_CANCION = `
  id, slug, titulo, genero, duracion_seg, portada,
  artistas!inner ( slug, nombre, genero )
`;

/** @returns {Cancion} */
function aCancion(fila) {
  return {
    id: fila.id,
    slug: fila.slug,
    tema: fila.titulo,
    artista: fila.artistas.nombre,
    artistaSlug: fila.artistas.slug,
    duracion: formatearDuracion(fila.duracion_seg),
    duracionSeg: fila.duracion_seg,
    genero: fila.genero || fila.artistas.genero,
    portada: fila.portada,
  };
}

function sinError({ data, error }) {
  if (error) throw new Error(`Error consultando Supabase: ${error.message}`);
  return data;
}

function cancionesPublicadas() {
  return db
    .from("canciones")
    .select(COLUMNAS_CANCION)
    .eq("publicada", true)
    .order("creada_en", { ascending: false });
}

/** Descubrimientos de la portada: las 10 más nuevas. */
export async function getCancionesDescubrimientos(cantidad = 10) {
  return sinError(await cancionesPublicadas().limit(cantidad)).map(aCancion);
}

export async function getCancionesDeArtista(slug) {
  return sinError(await cancionesPublicadas().eq("artistas.slug", slug)).map(aCancion);
}
