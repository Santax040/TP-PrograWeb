"use server";

/**
 * Server Actions de Redacción: guardar (nueva o existente) y borrar notas.
 *
 * Corren como el usuario logueado, así que la base aplica sus permisos: un
 * publicador solo puede tocar sus notas, y el trigger de `articulos` no le
 * deja destacarlas ni pasárselas a otro. Las validaciones de acá son para
 * dar mensajes claros; la última palabra la tiene la base.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  armarSlug,
  largos,
  minutosDeLectura,
  normalizarNombre,
  portadas,
  textoAParrafos,
} from "@/lib/redaccion";
import { obtenerSesion, puedeEscribir } from "@/lib/sesion";
import { categorias } from "@/lib/site";

export async function guardarNota(_estado, formData) {
  const { supabase, user, perfil } = await obtenerSesion();
  if (!user) return { error: "Se cerró tu sesión. Entrá de nuevo." };
  if (!puedeEscribir(perfil)) return { error: "Tu cuenta no tiene permiso para publicar." };

  const texto = (clave) => String(formData.get(clave) ?? "").trim();

  const id = Number(formData.get("id")) || null;
  const estado = formData.get("estado") === "publicada" ? "publicada" : "borrador";
  const titulo = texto("titulo");
  const bajada = texto("bajada");
  const categoria = texto("categoria");
  const firma = texto("firma") || perfil.nombre;
  const fecha = texto("fecha");
  const portada = texto("portada");
  const cuerpo = textoAParrafos(formData.get("cuerpo"));
  const nombresArtistas = [
    ...new Set(formData.getAll("artistas").map((n) => String(n).trim().slice(0, 80)).filter(Boolean)),
  ];

  // --- Validación -----------------------------------------------------------
  if (!titulo) return { error: "La nota necesita un título." };
  if (titulo.length > largos.titulo) return { error: `El título puede tener hasta ${largos.titulo} caracteres.` };
  if (bajada.length > largos.bajada) return { error: `La bajada puede tener hasta ${largos.bajada} caracteres.` };
  if (firma.length > largos.firma) return { error: `La firma puede tener hasta ${largos.firma} caracteres.` };
  if (!categorias.some((c) => c.slug === categoria)) return { error: "Elegí una sección." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return { error: "La fecha no es válida." };
  if (!portadas.some((p) => p.clases === portada)) return { error: "Elegí una portada." };
  if (cuerpo.join("").length > largos.cuerpo) return { error: "La nota es demasiado larga." };
  if (nombresArtistas.length > 20) return { error: "Hasta 20 artistas por nota." };
  // Un borrador puede estar a medias; una nota publicada, no.
  if (estado === "publicada") {
    if (!bajada) return { error: "Para publicar, escribí la bajada." };
    if (cuerpo.length === 0) return { error: "Para publicar, la nota necesita texto." };
  }

  // Artistas: los que coinciden con una ficha se vinculan (articulo_artistas);
  // el resto se guarda como texto en la nota.
  const { data: conFicha } = await supabase.from("artistas").select("id, nombre");
  const idsArtistas = [];
  const sinFicha = [];
  for (const nombre of nombresArtistas) {
    const ficha = conFicha?.find((a) => normalizarNombre(a.nombre) === normalizarNombre(nombre));
    if (ficha) idsArtistas.push(ficha.id);
    else sinFicha.push(nombre);
  }

  const fila = {
    artistas_mencionados: sinFicha,
    titulo,
    bajada,
    categoria,
    firma,
    fecha,
    portada,
    cuerpo,
    minutos_lectura: minutosDeLectura(cuerpo),
    premium: formData.get("premium") === "on",
    estado,
  };
  // Solo el admin puede destacar en la portada (la base lo fuerza igual).
  if (perfil.rol === "admin") fila.destacado = formData.get("destacado") === "on";

  // --- Guardar ----------------------------------------------------------------
  let articuloId = id;
  let slug;

  if (id) {
    const { data, error } = await supabase
      .from("articulos")
      .update(fila)
      .eq("id", id)
      .select("id, slug")
      .maybeSingle();
    if (error) return { error: "No se pudo guardar. Probá de nuevo." };
    if (!data) return { error: "Esta nota no existe o no es tuya." };
    slug = data.slug;
  } else {
    // La dirección de la nota sale del título y no cambia después, para no
    // romper links. Si ya existe, se le agrega un sufijo.
    const base = armarSlug(titulo) || "nota";
    for (const intento of [base, `${base}-${Date.now().toString(36).slice(-4)}`]) {
      const { data, error } = await supabase
        .from("articulos")
        .insert({ ...fila, slug: intento })
        .select("id, slug")
        .single();
      if (!error) {
        articuloId = data.id;
        slug = data.slug;
        break;
      }
      if (error.code !== "23505") return { error: "No se pudo guardar. Probá de nuevo." };
    }
    if (!articuloId) return { error: "Ya hay una nota con ese título. Cambialo un poco." };
  }

  // --- Artistas con ficha: se reemplaza la lista completa --------------------
  await supabase.from("articulo_artistas").delete().eq("articulo_id", articuloId);
  if (idsArtistas.length > 0) {
    await supabase
      .from("articulo_artistas")
      .insert(idsArtistas.map((artista_id) => ({ articulo_id: articuloId, artista_id })));
  }

  // Las páginas públicas se regeneran con el cambio en la próxima visita.
  revalidatePath("/", "layout");

  if (!id) redirect(`/redaccion/${articuloId}?guardada=${estado}`);

  return {
    ok: estado === "publicada" ? "Cambios publicados." : "Borrador guardado.",
    estado,
    slug,
  };
}

export async function borrarNota(formData) {
  const { supabase, user, perfil } = await obtenerSesion();
  if (!user || !puedeEscribir(perfil)) redirect("/login?siguiente=/redaccion");

  const id = Number(formData.get("id"));
  if (id) await supabase.from("articulos").delete().eq("id", id);

  revalidatePath("/", "layout");
  redirect("/redaccion?borrada=1");
}
