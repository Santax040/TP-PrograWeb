/**
 * Reglas de los temas que suben los artistas desde /estudio.
 *
 * Lo usan el formulario (navegador) y las Server Actions (servidor).
 */

import { formatearPrecio } from "@/lib/formato";

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

/** Los mismos límites que la base (`canciones.precio`). En pesos. */
export const PRECIO_MINIMO = 100;
export const PRECIO_MAXIMO = 1000000;

/** Cómo se puede ofrecer un tema. */
export const MODOS_DE_PRECIO = [
  { valor: "no-se-vende", nombre: "No se vende" },
  { valor: "gratis", nombre: "Descarga gratis" },
  { valor: "fijo", nombre: "Precio fijo" },
  { valor: "libre", nombre: "Pagá lo que quieras" },
];

/** De las columnas de la base a lo que muestra el formulario. */
export function modoDePrecio(precio, pagaLoQueQuieras) {
  if (precio === null || precio === undefined) return { modo: "no-se-vende", monto: "" };
  if (pagaLoQueQuieras) return { modo: "libre", monto: String(precio) };
  if (precio === 0) return { modo: "gratis", monto: "" };
  return { modo: "fijo", monto: String(precio) };
}

/**
 * Del formulario a las columnas de la base, o `{ error }`.
 *
 * @param {string} modo
 * @param {string|number} monto - El precio o, con "pagá lo que quieras", el mínimo.
 */
export function leerPrecio(modo, monto) {
  if (modo === "no-se-vende") return { precio: null, paga_lo_que_quieras: false };
  if (modo === "gratis") return { precio: 0, paga_lo_que_quieras: false };
  if (modo !== "fijo" && modo !== "libre") return { error: "Elegí cómo se ofrece el tema." };

  const texto = String(monto ?? "").trim();
  const numero = /^\d+$/.test(texto) ? Number(texto) : NaN;
  const enRango = numero >= PRECIO_MINIMO && numero <= PRECIO_MAXIMO;
  const limites = `entre ${formatearPrecio(PRECIO_MINIMO)} y ${formatearPrecio(PRECIO_MAXIMO)}`;

  if (modo === "fijo") {
    if (!enRango) return { error: `El precio tiene que ser un número entero ${limites}.` };
    return { precio: numero, paga_lo_que_quieras: false };
  }
  if (!enRango && numero !== 0) return { error: `El mínimo tiene que ser 0 o un número entero ${limites}.` };
  return { precio: numero, paga_lo_que_quieras: true };
}

/** "No se vende", "Gratis", "$ 500", "Desde $ 500" o "Pagá lo que quieras". */
export function etiquetaDePrecio(precio, pagaLoQueQuieras) {
  if (precio === null || precio === undefined) return "No se vende";
  if (pagaLoQueQuieras) return precio === 0 ? "Pagá lo que quieras" : `Desde ${formatearPrecio(precio)}`;
  return precio === 0 ? "Gratis" : formatearPrecio(precio);
}

/**
 * Declaración de derechos: la aceptan los artistas antes de subir o vender
 * (Configuración y /estudio). La base guarda la fecha
 * (`perfiles.derechos_aceptados_en`).
 */
export const DECLARACION_DERECHOS =
  "Declaro que la música que suba es de mi autoría o que tengo los derechos para publicarla y venderla, y autorizo a la revista a mostrarla, reproducirla y venderla en mi nombre.";

/** "03 - Toman - Seguimos (Original Mix).mp3" → "Toman - Seguimos (Original Mix)" */
export function tituloDesdeArchivo(nombre) {
  return String(nombre ?? "")
    .replace(/\.[^.]+$/, "")
    .replace(/^\s*\d+[\s.\-_]*/, "")
    .replace(/_/g, " ")
    .trim()
    .slice(0, largosCancion.titulo);
}
