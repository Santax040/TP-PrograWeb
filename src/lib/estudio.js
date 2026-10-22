/**
 * Reglas de los temas que suben los artistas desde /estudio.
 *
 * Lo usan el formulario (navegador) y las Server Actions (servidor).
 */

/** Lo mismo que acepta el bucket `musica` (25 MB). */
export const PESO_MAXIMO = 25 * 1024 * 1024;

export const TIPOS_DE_AUDIO = {
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
};

/**
 * Temas por artista. El plan gratis de Supabase tiene 1 GB para todo el
 * sitio: con 10 temas de unos 10 MB, entran muchos artistas antes de llenarlo.
 */
export const TEMAS_POR_ARTISTA = 10;

export const largosCancion = {
  titulo: 120,
  genero: 40,
};

export const largosFicha = {
  nombre: 60,
  genero: 40,
  bio: 600,
};

/** "03 - Toman - Seguimos (Original Mix).mp3" → "Toman - Seguimos (Original Mix)" */
export function tituloDesdeArchivo(nombre) {
  return String(nombre ?? "")
    .replace(/\.[^.]+$/, "")
    .replace(/^\s*\d+[\s.\-_]*/, "")
    .replace(/_/g, " ")
    .trim()
    .slice(0, largosCancion.titulo);
}
