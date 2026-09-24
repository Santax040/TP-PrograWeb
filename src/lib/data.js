/**
 * Capa de acceso a datos.
 *
 * Por ahora el contenido vive acá, escrito a mano. Todas las funciones de
 * abajo son `async` a propósito: cuando conectemos la base de datos real,
 * solo cambia el cuerpo de estas funciones y ninguna página necesita tocarse.
 *
 * Los nombres de artistas, lugares y fiestas son inventados.
 */

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
 * @property {string} autor
 * @property {string} fecha - Formato AAAA-MM-DD.
 * @property {number} minutosLectura
 * @property {boolean} destacado
 * @property {boolean} premium - Reservado para cuando se implemente la suscripción.
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

/** @type {Artista[]} */
const artistas = [
  {
    slug: "la-maquina-de-humo",
    nombre: "La Máquina de Humo",
    genero: "Post-punk",
    bio: "Cuarteto que arrancó tocando en un sótano de Chacarita y terminó llenando salas sin firmar con nadie.",
  },
  {
    slug: "nena-tornado",
    nombre: "Nena Tornado",
    genero: "Electrónica",
    bio: "Productora y DJ. Sus sets mezclan cumbia procesada con techno de madrugada.",
  },
  {
    slug: "el-club-del-ruido",
    nombre: "El Club del Ruido",
    genero: "Noise rock",
    bio: "Dos guitarras, una batería y una política estricta de no dar entrevistas.",
  },
  {
    slug: "dj-perejil",
    nombre: "DJ Perejil",
    genero: "House",
    bio: "Residente de las fiestas de sótano desde 2019. Especialista en cerrar a las siete de la mañana.",
  },
  {
    slug: "coro-de-vecinos",
    nombre: "Coro de Vecinos",
    genero: "Indie",
    bio: "Proyecto de siete personas que se conocieron reclamando por el ruido en un edificio de Almagro.",
  },
];

/** @type {Articulo[]} */
const articulos = [
  {
    slug: "cronica-de-una-fiesta-que-no-termino",
    titulo: "Crónica de una fiesta que no terminó",
    bajada:
      "Entramos a las dos de la mañana a una fábrica reciclada en Barracas. Salimos cuando ya había sol y panaderías abiertas.",
    cuerpo: [
      "La dirección llegó por mensaje tres horas antes. Sin nombre, sin flyer, apenas una esquina y un horario. Así funcionan las fiestas que importan: el que sabe, sabe.",
      "Adentro había unas cuatrocientas personas y un sistema de sonido que claramente había costado más que el alquiler del lugar. Nadie filmaba. Esa era la regla y se cumplía sola.",
      "A las cuatro entró Nena Tornado y el clima cambió. Empezó lento, casi molestando, y recién a la media hora soltó lo que todos estaban esperando.",
      "A las siete, cuando abrieron las puertas, afuera estaba la panadería de la esquina levantando la persiana. Nadie se quería ir.",
    ],
    categoria: "fiestas",
    autor: "Redacción",
    fecha: "2026-09-20",
    minutosLectura: 6,
    destacado: true,
    premium: false,
    portada: "from-fuchsia-600 via-purple-700 to-indigo-900",
    artistas: ["nena-tornado", "dj-perejil"],
  },
  {
    slug: "la-maquina-de-humo-entrevista",
    titulo: "La Máquina de Humo: «No queremos que nos entiendan»",
    bajada:
      "Hablamos con la banda que llenó tres noches seguidas sin sello discográfico ni prensa.",
    cuerpo: [
      "Nos citaron en la sala de ensayo, un primer piso sin ventanas donde hace calor incluso en invierno. Llegaron tarde los cuatro, por separado.",
      "«Nos ofrecieron firmar dos veces», cuenta la bajista. «Las dos veces la charla terminó cuando preguntaron si podíamos hacer los temas más cortos».",
      "El disco nuevo dura cincuenta y un minutos y tiene seis canciones. La más corta es de cuatro. Ninguna tiene estribillo en el sentido tradicional.",
      "«La gente que tiene que llegar, llega», dicen. Por ahora les viene funcionando.",
    ],
    categoria: "entrevistas",
    autor: "Redacción",
    fecha: "2026-09-18",
    minutosLectura: 9,
    destacado: true,
    premium: true,
    portada: "from-amber-500 via-orange-600 to-red-800",
    artistas: ["la-maquina-de-humo"],
  },
  {
    slug: "guia-de-sotanos",
    titulo: "Guía de sótanos: dónde se toca lo que no llega a la radio",
    bajada:
      "Seis lugares chicos, mal ventilados y con la mejor programación de la ciudad.",
    cuerpo: [
      "La escena no pasa por los estadios. Pasa por lugares de ciento veinte personas donde el escenario está a la misma altura que el público.",
      "Todos los que listamos abren al menos tres noches por semana y cobran entradas que salen menos que dos cervezas en el centro.",
      "Regla general: si tiene cartel luminoso en la puerta, probablemente no sea el lugar que estás buscando.",
    ],
    categoria: "musica",
    autor: "Redacción",
    fecha: "2026-09-15",
    minutosLectura: 7,
    destacado: false,
    premium: false,
    portada: "from-emerald-500 via-teal-700 to-slate-900",
    artistas: ["el-club-del-ruido", "coro-de-vecinos"],
  },
  {
    slug: "el-negocio-de-las-entradas",
    titulo: "El negocio de las entradas: quién se queda con tu plata",
    bajada:
      "Pagás una entrada de treinta mil pesos. Te contamos cuánto llega realmente a la banda.",
    cuerpo: [
      "Entre el cargo por servicio, la comisión de la plataforma y el alquiler de la sala, el número que llega a los músicos sorprende a cualquiera.",
      "Hicimos el ejercicio con tres fechas reales de salas medianas. En ninguna la banda se quedó con más de un tercio.",
      "Hay alternativas. Algunas funcionan y otras son marketing.",
    ],
    categoria: "quilombo",
    autor: "Redacción",
    fecha: "2026-09-12",
    minutosLectura: 11,
    destacado: false,
    premium: true,
    portada: "from-rose-500 via-pink-700 to-purple-900",
    artistas: [],
  },
  {
    slug: "diez-discos-del-ano",
    titulo: "Diez discos que te perdiste este año",
    bajada: "Ninguno llegó a las listas grandes. Todos merecían estar.",
    cuerpo: [
      "Hicimos la lista sin mirar números de reproducciones, que es la única manera de que una lista así sirva para algo.",
      "Están ordenados por fecha de salida, no por preferencia. Discutir el orden es parte de la gracia.",
    ],
    categoria: "musica",
    autor: "Redacción",
    fecha: "2026-09-08",
    minutosLectura: 8,
    destacado: false,
    premium: false,
    portada: "from-sky-500 via-blue-700 to-indigo-900",
    artistas: ["coro-de-vecinos", "nena-tornado"],
  },
  {
    slug: "la-noche-despues-de-las-restricciones",
    titulo: "La noche, después de las restricciones",
    bajada:
      "Tres años de horarios recortados cambiaron para siempre a qué hora sale la gente.",
    cuerpo: [
      "Antes se entraba a las dos. Ahora hay fiestas que arrancan a las diez de la noche y terminan a las cuatro.",
      "Los lugares se adaptaron. El público, en parte, también. Pero no todos están contentos.",
      "«Perdimos la madrugada», resume el encargado de una sala de Palermo. «Ganamos otra cosa, pero perdimos la madrugada».",
    ],
    categoria: "quilombo",
    autor: "Redacción",
    fecha: "2026-09-02",
    minutosLectura: 5,
    destacado: false,
    premium: false,
    portada: "from-violet-500 via-indigo-700 to-slate-900",
    artistas: [],
  },
];

/** @type {Evento[]} */
const eventos = [
  {
    slug: "subsuelo-presenta-octubre",
    nombre: "Subsuelo Presenta: Octubre",
    fecha: "2026-10-03",
    lugar: "Galpón Mecánica",
    ciudad: "Buenos Aires",
    genero: "Electrónica",
    precioDesde: 18000,
    lineup: ["nena-tornado", "dj-perejil"],
    descripcion:
      "Primera fecha del ciclo. Dos pistas, sistema de sonido nuevo y cierre garantizado a las siete.",
    portada: "from-fuchsia-600 to-indigo-900",
  },
  {
    slug: "la-maquina-de-humo-en-vivo",
    nombre: "La Máquina de Humo — Disco nuevo en vivo",
    fecha: "2026-10-11",
    lugar: "Sala Continental",
    ciudad: "Buenos Aires",
    genero: "Post-punk",
    precioDesde: 25000,
    lineup: ["la-maquina-de-humo"],
    descripcion:
      "Presentación completa del disco, de principio a fin y en orden. Sin teloneros.",
    portada: "from-amber-500 to-red-800",
  },
  {
    slug: "ruido-blanco-vol-4",
    nombre: "Ruido Blanco vol. 4",
    fecha: "2026-10-18",
    lugar: "Club Almagro",
    ciudad: "Buenos Aires",
    genero: "Noise rock",
    precioDesde: 12000,
    lineup: ["el-club-del-ruido", "coro-de-vecinos"],
    descripcion:
      "Cuatro bandas, cuatro horas y protectores auditivos gratis en la entrada. No es un chiste.",
    portada: "from-emerald-500 to-slate-900",
  },
  {
    slug: "matine-de-sotano",
    nombre: "Matiné de Sótano",
    fecha: "2026-10-25",
    lugar: "Depósito 9",
    ciudad: "La Plata",
    genero: "House",
    precioDesde: 9000,
    lineup: ["dj-perejil"],
    descripcion:
      "De seis de la tarde a medianoche. Para los que ya no aguantan hasta las siete de la mañana.",
    portada: "from-orange-500 to-purple-900",
  },
  {
    slug: "festival-vecinos",
    nombre: "Festival Vecinos",
    fecha: "2026-11-08",
    lugar: "Parque Sur",
    ciudad: "Rosario",
    genero: "Indie",
    precioDesde: 30000,
    lineup: ["coro-de-vecinos", "la-maquina-de-humo", "nena-tornado"],
    descripcion:
      "Al aire libre y con lluvia o sol. Tres escenarios y once proyectos en cartel.",
    portada: "from-sky-500 to-indigo-900",
  },
  {
    slug: "cierre-de-temporada",
    nombre: "Cierre de Temporada",
    fecha: "2026-11-22",
    lugar: "Galpón Mecánica",
    ciudad: "Buenos Aires",
    genero: "Electrónica",
    precioDesde: 22000,
    lineup: ["nena-tornado", "dj-perejil", "el-club-del-ruido"],
    descripcion:
      "La última del año. Se agota siempre, todos los años, sin excepción.",
    portada: "from-rose-500 to-purple-900",
  },
];

// --- Consultas ------------------------------------------------------------

export async function getArticulos() {
  return [...articulos].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export async function getArticulosDestacados() {
  const todos = await getArticulos();
  return todos.filter((a) => a.destacado);
}

export async function getArticulosPorCategoria(categoria) {
  const todos = await getArticulos();
  return todos.filter((a) => a.categoria === categoria);
}

export async function getArticulo(slug) {
  return articulos.find((a) => a.slug === slug);
}

export async function getEventos() {
  return [...eventos].sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export async function getEvento(slug) {
  return eventos.find((e) => e.slug === slug);
}

export async function getArtista(slug) {
  return artistas.find((a) => a.slug === slug);
}

export async function getArtistas(slugs) {
  return artistas.filter((a) => slugs.includes(a.slug));
}

export async function getTodosLosArtistas() {
  return [...artistas];
}

/** Notas donde se menciona al artista. */
export async function getArticulosDeArtista(slug) {
  const todos = await getArticulos();
  return todos.filter((a) => a.artistas.includes(slug));
}

/** Fechas donde el artista está en el line-up. */
export async function getEventosDeArtista(slug) {
  const todos = await getEventos();
  return todos.filter((e) => e.lineup.includes(slug));
}
