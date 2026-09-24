/**
 * Configuración global del sitio.
 *
 * El nombre todavía no está decidido: cambiándolo acá se actualiza en toda
 * la aplicación (header, footer, título de las pestañas, metadatos).
 */
export const site = {
  nombre: "SUBSUELO",
  tagline: "Noche, música y quilombo",
  descripcion:
    "Revista digital sobre la noche: crónicas de fiestas, música nueva y la agenda de lo que se viene.",
};

export const categorias = [
  { slug: "fiestas", nombre: "Fiestas" },
  { slug: "musica", nombre: "Música" },
  { slug: "quilombo", nombre: "Quilombo" },
  { slug: "entrevistas", nombre: "Entrevistas" },
];

/**
 * Pagos habilitados o no. Mientras sea `false`, la página de suscripción
 * muestra los planes pero avisa que todavía no se puede pagar, y las notas
 * premium se pueden leer completas.
 */
export const pagosActivos = false;

/**
 * Planes de suscripción. Los precios son ficticios.
 *
 * Los beneficios listan solo lo que el sitio tiene de verdad: no se promete
 * nada que todavía no exista.
 */
export const planes = [
  {
    slug: "libre",
    nombre: "Libre",
    precio: 0,
    periodo: null,
    bajada: "Para mirar de afuera.",
    beneficios: ["Notas abiertas", "Agenda completa de fechas", "Fichas de artistas"],
    destacado: false,
  },
  {
    slug: "mensual",
    nombre: "Mensual",
    precio: 3500,
    periodo: "mes",
    bajada: "Para los que ya están adentro.",
    beneficios: ["Todo lo de Libre", "Notas exclusivas para suscriptores"],
    destacado: false,
  },
  {
    slug: "anual",
    nombre: "Anual",
    precio: 35000,
    periodo: "año",
    bajada: "Pagás diez meses, tenés doce.",
    beneficios: ["Todo lo de Mensual", "Dos meses gratis"],
    destacado: true,
  },
];
