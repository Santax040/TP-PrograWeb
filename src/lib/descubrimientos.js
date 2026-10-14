/**
 * Descubrimientos: las canciones que suenan en el tocadiscos de la portada.
 *
 * Por ahora están escritas acá, son ficticias y no tienen audio: todavía no
 * hay forma de subir música. Cuando los artistas puedan subir sus temas, esta
 * lista va a salir de la base, y cada canción va a traer su archivo de audio.
 *
 * Los artistas se nombran por slug y tienen que existir en la tabla
 * `artistas`; el nombre que se muestra sale de la base.
 *
 * @typedef {Object} Cancion
 * @property {string} slug
 * @property {string} tema
 * @property {string} artista - Slug del artista.
 * @property {string} duracion - "m:ss".
 * @property {string} portada - Clases de Tailwind del gradiente de la etiqueta.
 */

/** @type {Cancion[]} */
export const descubrimientos = [
  {
    slug: "anden-3-6am",
    tema: "Andén 3, 6 a.m.",
    artista: "nena-tornado",
    duracion: "6:48",
    portada: "from-teal-300 to-indigo-700",
  },
  {
    slug: "humo-en-la-ventanilla",
    tema: "Humo en la ventanilla",
    artista: "la-maquina-de-humo",
    duracion: "4:12",
    portada: "from-slate-300 to-emerald-800",
  },
  {
    slug: "persiana-baja",
    tema: "Persiana baja",
    artista: "dj-perejil",
    duracion: "5:20",
    portada: "from-violet-300 to-cyan-700",
  },
  {
    slug: "estatica",
    tema: "Estática",
    artista: "el-club-del-ruido",
    duracion: "3:05",
    portada: "from-sky-200 to-slate-800",
  },
  {
    slug: "patio-compartido",
    tema: "Patio compartido",
    artista: "coro-de-vecinos",
    duracion: "3:37",
    portada: "from-emerald-200 to-violet-700",
  },
];
