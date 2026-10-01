/**
 * Capa de acceso a datos.
 *
 * El contenido vive en Supabase (tablas `articulos`, `artistas`, `eventos` y
 * sus relaciones). Estas funciones lo consultan y lo devuelven con la misma
 * forma que tenía cuando estaba escrito a mano, así las páginas no cambian.
 *
 * Se consulta como visitante sin login (`supabasePublico`): solo aparecen las
 * notas publicadas, nunca los borradores.
 */

import { supabasePublico as db } from "@/lib/supabase/publico";

/**
 * Forma de cada tipo de dato. Son comentarios JSDoc: no cambian cómo corre
 * el código, pero el editor los usa para autocompletar y documentan qué
 * campos tiene cada cosa.
 *
 * @typedef {Object} Articulo
 * @property {string} slug
 * @property {string} titulo
 * @property {string} bajada
 * @property {string[]} cuerpo - Un string por párrafo.
 * @property {"fiestas" | "musica" | "quilombo" | "entrevistas"} categoria
 * @property {string} autor - Firma que se muestra.
 * @property {string} fecha - Formato AAAA-MM-DD.
 * @property {number} minutosLectura
 * @property {boolean} destacado
 * @property {boolean} premium
 * @property {string} portada - Clases de Tailwind del gradiente que hace de portada.
 * @property {string[]} artistas - Slugs de los artistas mencionados.
 *
 * @typedef {Object} Artista
 * @property {string} slug
 * @property {string} nombre
 * @property {string} genero
 * @property {string} bio
 *
 * @typedef {Object} Evento
 * @property {string} slug
 * @property {string} nombre
 * @property {string} fecha - Formato AAAA-MM-DD.
 * @property {string} lugar
 * @property {string} ciudad
 * @property {string} genero
 * @property {number} precioDesde - En pesos.
 * @property {string[]} lineup - Slugs de artistas, el cabeza de cartel primero.
 * @property {string} descripcion
 * @property {string} portada
 */

// --- Columnas y conversión ------------------------------------------------
// La base usa snake_case (minutos_lectura); el código, camelCase.

const COLUMNAS_ARTICULO = `
  slug, titulo, bajada, cuerpo, categoria, firma, fecha, minutos_lectura,
  destacado, premium, portada,
  articulo_artistas ( artistas ( slug ) )
`;

const COLUMNAS_EVENTO = `
  slug, nombre, fecha, lugar, ciudad, genero, precio_desde, descripcion, portada,
  evento_artistas ( orden, artistas ( slug ) )
`;

const COLUMNAS_ARTISTA = "slug, nombre, genero, bio";

/** @returns {Articulo} */
function aArticulo(fila) {
  return {
    slug: fila.slug,
    titulo: fila.titulo,
    bajada: fila.bajada,
    cuerpo: fila.cuerpo,
    categoria: fila.categoria,
    autor: fila.firma,
    fecha: fila.fecha,
    minutosLectura: fila.minutos_lectura,
    destacado: fila.destacado,
    premium: fila.premium,
    portada: fila.portada,
    artistas: fila.articulo_artistas.map((r) => r.artistas.slug),
  };
}

/** @returns {Evento} */
function aEvento(fila) {
  return {
    slug: fila.slug,
    nombre: fila.nombre,
    fecha: fila.fecha,
    lugar: fila.lugar,
    ciudad: fila.ciudad,
    genero: fila.genero,
    precioDesde: fila.precio_desde,
    lineup: [...fila.evento_artistas]
      .sort((a, b) => a.orden - b.orden)
      .map((r) => r.artistas.slug),
    descripcion: fila.descripcion,
    portada: fila.portada,
  };
}

/**
 * Si la consulta falla, se corta con un error en vez de mostrar una página
 * vacía: así el problema se ve y no parece que no haya contenido.
 */
function sinError({ data, error }) {
  if (error) throw new Error(`Error consultando Supabase: ${error.message}`);
  return data;
}

function notasPublicadas() {
  return db
    .from("articulos")
    .select(COLUMNAS_ARTICULO)
    .eq("estado", "publicada")
    .order("fecha", { ascending: false });
}

// --- Consultas ------------------------------------------------------------

export async function getArticulos() {
  return sinError(await notasPublicadas()).map(aArticulo);
}

export async function getArticulosDestacados() {
  return sinError(await notasPublicadas().eq("destacado", true)).map(aArticulo);
}

export async function getArticulosPorCategoria(categoria) {
  return sinError(await notasPublicadas().eq("categoria", categoria)).map(aArticulo);
}

export async function getArticulo(slug) {
  const fila = sinError(await notasPublicadas().eq("slug", slug).maybeSingle());
  return fila ? aArticulo(fila) : undefined;
}

export async function getEventos() {
  const filas = sinError(
    await db.from("eventos").select(COLUMNAS_EVENTO).order("fecha", { ascending: true }),
  );
  return filas.map(aEvento);
}

export async function getEvento(slug) {
  const fila = sinError(
    await db.from("eventos").select(COLUMNAS_EVENTO).eq("slug", slug).maybeSingle(),
  );
  return fila ? aEvento(fila) : undefined;
}

export async function getArtista(slug) {
  const fila = sinError(
    await db.from("artistas").select(COLUMNAS_ARTISTA).eq("slug", slug).maybeSingle(),
  );
  return fila ?? undefined;
}

export async function getArtistas(slugs) {
  if (slugs.length === 0) return [];
  const filas = sinError(await db.from("artistas").select(COLUMNAS_ARTISTA).in("slug", slugs));
  // Se devuelven en el orden pedido: en un line-up, el cabeza de cartel primero.
  return slugs.map((s) => filas.find((a) => a.slug === s)).filter(Boolean);
}

export async function getTodosLosArtistas() {
  return sinError(await db.from("artistas").select(COLUMNAS_ARTISTA).order("nombre"));
}

/** Notas donde se menciona al artista. */
export async function getArticulosDeArtista(slug) {
  // "!inner" hace que solo vuelvan las notas que tienen a ese artista.
  const filas = sinError(
    await db
      .from("articulos")
      .select(`${COLUMNAS_ARTICULO}, filtro:articulo_artistas!inner ( artistas!inner ( slug ) )`)
      .eq("estado", "publicada")
      .eq("filtro.artistas.slug", slug)
      .order("fecha", { ascending: false }),
  );
  return filas.map(aArticulo);
}

/** Fechas donde el artista está en el line-up. */
export async function getEventosDeArtista(slug) {
  const filas = sinError(
    await db
      .from("eventos")
      .select(`${COLUMNAS_EVENTO}, filtro:evento_artistas!inner ( artistas!inner ( slug ) )`)
      .eq("filtro.artistas.slug", slug)
      .order("fecha", { ascending: true }),
  );
  return filas.map(aEvento);
}
