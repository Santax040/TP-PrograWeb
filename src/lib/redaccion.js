/**
 * Reglas de las notas que se escriben desde Redacción.
 *
 * Lo usan el editor (navegador) y la Server Action que guarda (servidor).
 */

/**
 * Portadas disponibles. Son gradientes de Tailwind y tienen que estar
 * escritos acá, completos: Tailwind solo genera las clases que encuentra en
 * el código, así que una clase armada en el momento no tendría estilos.
 * `.bruma` las lleva al menta del sitio, así que en pantalla se ven suaves.
 */
export const portadas = [
  { nombre: "Fucsia", clases: "from-fuchsia-600 via-purple-700 to-indigo-900" },
  { nombre: "Naranja", clases: "from-amber-500 via-orange-600 to-red-800" },
  { nombre: "Verde", clases: "from-emerald-500 via-teal-700 to-slate-900" },
  { nombre: "Rosa", clases: "from-rose-500 via-pink-700 to-purple-900" },
  { nombre: "Celeste", clases: "from-sky-500 via-blue-700 to-indigo-900" },
  { nombre: "Violeta", clases: "from-violet-500 via-indigo-700 to-slate-900" },
];

export const largos = {
  titulo: 140,
  bajada: 300,
  firma: 60,
  cuerpo: 40000,
};

/** "La noche, después de todo" → "la-noche-despues-de-todo" */
export function armarSlug(titulo) {
  return titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // saca tildes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

/**
 * El cuerpo se escribe como texto corrido, con un renglón en blanco entre
 * párrafos, y se guarda como lista de párrafos (como espera la página de
 * la nota).
 */
export function textoAParrafos(texto) {
  return String(texto ?? "")
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

export function parrafosATexto(parrafos) {
  return (parrafos ?? []).join("\n\n");
}

/**
 * Para comparar nombres de artistas sin que importen mayúsculas, tildes ni
 * espacios de más: "Nena  Tornado" y "nena tornado" son el mismo.
 */
export function normalizarNombre(nombre) {
  return String(nombre ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** A unas 200 palabras por minuto, como mínimo 1. */
export function minutosDeLectura(parrafos) {
  const palabras = parrafos.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}
