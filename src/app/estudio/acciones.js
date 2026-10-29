"use server";

/**
 * Server Actions de /estudio: la ficha del artista y sus temas.
 *
 * Corren como el usuario logueado, así que la base aplica sus permisos: un
 * artista solo toca su ficha y sus temas, y el archivo tiene que estar en su
 * carpeta del bucket. Las validaciones de acá son para dar mensajes claros;
 * la última palabra la tiene la base.
 *
 * El audio no pasa por acá: el navegador lo sube directo a Storage (una
 * Server Action no acepta archivos de 10 MB). Acá solo se guarda la fila.
 */

import { revalidatePath } from "next/cache";
import { largosCancion, largosFicha, TEMAS_POR_ARTISTA } from "@/lib/estudio";
import { armarSlug, portadas } from "@/lib/redaccion";
import { obtenerSesion } from "@/lib/sesion";

function esArtista(perfil) {
  return perfil?.rol === "artista" || perfil?.rol === "admin";
}

/** La ficha de quien está logueado, o null. */
async function miFicha(supabase, userId) {
  const { data } = await supabase
    .from("artistas")
    .select("id, slug")
    .eq("perfil_id", userId)
    .maybeSingle();
  return data;
}

/** Lo público que muestra temas: la portada y la ficha del artista. */
function revalidarPublico(slug) {
  revalidatePath("/");
  if (slug) revalidatePath(`/artistas/${slug}`);
  revalidatePath("/estudio");
}

/** Los artistas de antes de la declaración la aceptan acá antes de subir o vender. */
export async function aceptarDerechos() {
  const { supabase, user, perfil } = await obtenerSesion();
  if (!user) return { error: "Se cerró tu sesión. Entrá de nuevo." };
  if (!esArtista(perfil)) return { error: "Tu cuenta no es de artista." };

  const { error } = await supabase.rpc("aceptar_derechos");
  if (error) return { error: "No se pudo guardar. Probá de nuevo." };

  revalidatePath("/estudio");
  return { ok: "Listo." };
}

export async function guardarFicha(_estado, formData) {
  const { supabase, user, perfil } = await obtenerSesion();
  if (!user) return { error: "Se cerró tu sesión. Entrá de nuevo." };
  if (!esArtista(perfil)) return { error: "Primero pasá tu cuenta a artista en Configuración." };

  const texto = (clave) => String(formData.get(clave) ?? "").trim();
  const nombre = texto("nombre");
  const genero = texto("genero");
  const bio = texto("bio");

  if (!nombre) return { error: "Escribí tu nombre de artista." };
  if (!genero) return { error: "Escribí tu género." };
  if (nombre.length > largosFicha.nombre) return { error: `El nombre puede tener hasta ${largosFicha.nombre} caracteres.` };
  if (genero.length > largosFicha.genero) return { error: `El género puede tener hasta ${largosFicha.genero} caracteres.` };
  if (bio.length > largosFicha.bio) return { error: `La bio puede tener hasta ${largosFicha.bio} caracteres.` };

  const { data: slug, error } = await supabase.rpc("guardar_mi_ficha", {
    p_nombre: nombre,
    p_genero: genero,
    p_bio: bio,
  });
  if (error) return { error: "No se pudo guardar la ficha. Probá de nuevo." };

  revalidarPublico(slug);
  return { ok: "Ficha guardada.", slug };
}

/**
 * Guarda el tema después de que el navegador subió el archivo.
 *
 * @param {{ titulo: string, genero: string, portada: string, duracion: number, archivo: string }} datos
 */
export async function guardarCancion(datos) {
  const { supabase, user, perfil } = await obtenerSesion();
  if (!user) return { error: "Se cerró tu sesión. Entrá de nuevo." };
  if (!esArtista(perfil)) return { error: "Tu cuenta no es de artista." };

  const ficha = await miFicha(supabase, user.id);
  if (!ficha) return { error: "Primero armá tu ficha de artista." };

  const titulo = String(datos?.titulo ?? "").trim();
  const genero = String(datos?.genero ?? "").trim();
  const portada = String(datos?.portada ?? "");
  const duracion = Math.round(Number(datos?.duracion));
  const archivo = String(datos?.archivo ?? "");

  if (!titulo) return { error: "El tema necesita un título." };
  if (titulo.length > largosCancion.titulo) return { error: `El título puede tener hasta ${largosCancion.titulo} caracteres.` };
  if (genero.length > largosCancion.genero) return { error: `El género puede tener hasta ${largosCancion.genero} caracteres.` };
  if (!portadas.some((p) => p.clases === portada)) return { error: "Elegí un color para la etiqueta." };
  if (!(duracion >= 1 && duracion <= 3600)) return { error: "No se pudo leer la duración del audio." };

  // Solo archivos de su carpeta con el nombre que arma el formulario.
  const nombre = archivo.slice(user.id.length + 1);
  if (!archivo.startsWith(`${user.id}/`) || !/^[0-9a-f-]{36}\.(mp3|m4a)$/.test(nombre)) {
    return { error: "El archivo no es válido." };
  }

  // Que el archivo esté de verdad en Storage (el artista puede ver su carpeta).
  const { data: enStorage } = await supabase.storage.from("musica").list(user.id, { search: nombre });
  if (!enStorage?.some((o) => o.name === nombre)) return { error: "El audio no terminó de subirse. Probá de nuevo." };

  // Los retirados (borrados pero ya vendidos) no cuentan para el tope.
  const { count } = await supabase
    .from("canciones")
    .select("id", { count: "exact", head: true })
    .eq("artista_id", ficha.id)
    .is("retirada_en", null);
  if ((count ?? 0) >= TEMAS_POR_ARTISTA) {
    return { error: `Ya tenés ${TEMAS_POR_ARTISTA} temas. Borrá uno para subir otro.` };
  }

  const fila = { titulo, genero, portada, duracion_seg: duracion, archivo, artista_id: ficha.id };

  // Como las notas: la dirección sale del título y, si ya existe, lleva sufijo.
  const base = `${ficha.slug}-${armarSlug(titulo) || "tema"}`.slice(0, 90);
  for (const intento of [base, `${base}-${Date.now().toString(36).slice(-4)}`]) {
    const { error } = await supabase.from("canciones").insert({ ...fila, slug: intento });
    if (!error) {
      revalidarPublico(ficha.slug);
      return { ok: "Tema subido. Ya suena en Descubrimientos." };
    }
    if (error.code !== "23505") return { error: "No se pudo guardar el tema. Probá de nuevo." };
  }
  return { error: "Ya tenés un tema con ese título. Cambialo un poco." };
}

/** Mostrar u ocultar un tema. Oculto, solo lo escucha su artista. */
export async function cambiarVisibilidad(id, publicada) {
  const { supabase, user } = await obtenerSesion();
  if (!user) return { error: "Se cerró tu sesión. Entrá de nuevo." };

  const { data, error } = await supabase
    .from("canciones")
    .update({ publicada: Boolean(publicada) })
    .eq("id", id)
    .select("artistas ( slug )")
    .maybeSingle();
  if (error || !data) return { error: "No se pudo cambiar. Probá de nuevo." };

  revalidarPublico(data.artistas?.slug);
  return { ok: publicada ? "El tema se ve de nuevo." : "El tema quedó oculto." };
}

/**
 * Borra el tema y su archivo. Si ya se vendió, la base no deja borrarlo
 * (los compradores lo tienen que poder bajar): se retira, queda oculto y el
 * archivo se conserva.
 */
export async function borrarCancion(id) {
  const { supabase, user } = await obtenerSesion();
  if (!user) return { error: "Se cerró tu sesión. Entrá de nuevo." };

  const { data, error } = await supabase
    .from("canciones")
    .delete()
    .eq("id", id)
    .select("archivo, artistas ( slug )")
    .maybeSingle();

  // 23503: lo frena la clave de `compras` (on delete restrict).
  if (error?.code === "23503") {
    const { error: errorRetiro } = await supabase.rpc("retirar_cancion", { p_cancion_id: id });
    if (errorRetiro) return { error: "No se pudo borrar. Probá de nuevo." };
    revalidarPublico();
    return { ok: "Tema borrado. Quienes lo compraron lo siguen pudiendo bajar." };
  }
  if (error || !data) return { error: "No se pudo borrar. Probá de nuevo." };

  // Si el archivo no se puede borrar, queda huérfano pero nadie lo escucha:
  // sin fila, la ruta de audio no lo encuentra.
  const { error: errorArchivo } = await supabase.storage.from("musica").remove([data.archivo]);
  if (errorArchivo) console.error("No se pudo borrar el audio", data.archivo, errorArchivo);

  revalidarPublico(data.artistas?.slug);
  return { ok: "Tema borrado." };
}
