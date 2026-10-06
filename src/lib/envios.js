/**
 * Qué se le pide al lector en cada tipo de propuesta.
 *
 * Una sola definición para el formulario (qué campos mostrar), la Server
 * Action (qué validar) y el mail al admin (qué mostrar y en qué orden). Si se
 * agrega un campo acá, aparece en los tres lugares.
 *
 * En la base se guarda así: `titulo` va a su columna; el resto, a `datos`.
 *
 * @typedef {Object} Campo
 * @property {string} nombre - Clave en `datos` (o "titulo").
 * @property {string} etiqueta
 * @property {"texto" | "parrafo" | "fecha" | "categoria" | "links"} tipo
 * @property {boolean} [obligatorio]
 * @property {number} max - Largo máximo en caracteres.
 * @property {string} [ayuda]
 */

/** @type {Record<"nota" | "evento" | "artista", { nombre: string, bajada: string, campos: Campo[] }>} */
export const tiposDeEnvio = {
  nota: {
    nombre: "Una nota",
    bajada: "Una crónica, una reseña, una entrevista que hiciste.",
    campos: [
      { nombre: "titulo", etiqueta: "Título", tipo: "texto", obligatorio: true, max: 140 },
      { nombre: "categoria", etiqueta: "Sección", tipo: "categoria", obligatorio: true, max: 20 },
      {
        nombre: "texto",
        etiqueta: "La nota",
        tipo: "parrafo",
        obligatorio: true,
        max: 12000,
        ayuda: "Pegala completa. Si es muy larga, podés pasar un link en vez del texto.",
      },
      {
        nombre: "links",
        etiqueta: "Links",
        tipo: "links",
        max: 1000,
        ayuda: "Fotos, audio, el documento completo. Uno por renglón.",
      },
    ],
  },
  evento: {
    nombre: "Una fecha",
    bajada: "Una fiesta o un show que tendría que estar en la agenda.",
    campos: [
      { nombre: "titulo", etiqueta: "Nombre del evento", tipo: "texto", obligatorio: true, max: 140 },
      { nombre: "fecha", etiqueta: "Fecha", tipo: "fecha", obligatorio: true, max: 10 },
      { nombre: "lugar", etiqueta: "Lugar", tipo: "texto", obligatorio: true, max: 120 },
      { nombre: "ciudad", etiqueta: "Ciudad", tipo: "texto", obligatorio: true, max: 80 },
      {
        nombre: "lineup",
        etiqueta: "Quiénes tocan",
        tipo: "parrafo",
        max: 600,
        ayuda: "Primero el que cierra.",
      },
      { nombre: "descripcion", etiqueta: "Contanos de qué va", tipo: "parrafo", max: 2000 },
      { nombre: "links", etiqueta: "Links", tipo: "links", max: 1000, ayuda: "Entradas, flyer, redes. Uno por renglón." },
    ],
  },
  artista: {
    nombre: "Un artista",
    bajada: "Alguien que tendríamos que estar escuchando.",
    campos: [
      { nombre: "titulo", etiqueta: "Nombre", tipo: "texto", obligatorio: true, max: 140 },
      { nombre: "genero", etiqueta: "Género", tipo: "texto", obligatorio: true, max: 60 },
      {
        nombre: "bio",
        etiqueta: "Quién es",
        tipo: "parrafo",
        obligatorio: true,
        max: 3000,
        ayuda: "De dónde sale, qué hace, por qué te importa.",
      },
      {
        nombre: "links",
        etiqueta: "Dónde escucharlo",
        tipo: "links",
        max: 1000,
        ayuda: "Spotify, Bandcamp, Instagram. Uno por renglón.",
      },
    ],
  },
};

export const estadosDeEnvio = {
  nuevo: "Enviada",
  leido: "Leída",
  aceptado: "Aceptada",
  descartado: "No entró",
};

/**
 * Separa un campo de links en una lista. Solo se aceptan direcciones web
 * (http o https): nada de `javascript:` ni otras cosas raras en el mail.
 */
export function separarLinks(texto) {
  return String(texto ?? "")
    .split(/\s+/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function esLinkValido(link) {
  try {
    const url = new URL(link);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
