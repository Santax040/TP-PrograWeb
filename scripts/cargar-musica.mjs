/**
 * Carga inicial de música: sube temas al bucket privado `musica` y los anota
 * en la base, con su ficha de artista.
 *
 * Uso (desde la raíz del repo):
 *   node --env-file=.env.local scripts/cargar-musica.mjs <lista.json>
 *
 * La lista va FUERA del repo (el repo es público y no tiene por qué mostrar
 * rutas de la compu de nadie). Es un JSON con un objeto por tema:
 *   { "archivo": "D:/.../tema.mp3", "artista": "Toman", "titulo": "Seguimos", "genero": "Minimal" }
 *
 * - Usa la clave secreta (SUPABASE_SECRET_KEY): se saltea los permisos.
 * - La duración se lee del archivo con `music-metadata`.
 * - Los archivos van a `musica/semilla/<slug>.mp3`.
 * - Crea la ficha del artista si no existe, con la bio vacía: son músicos
 *   reales y no se inventan datos sobre ellos.
 * - Se puede correr dos veces: si el tema ya está, lo saltea.
 * - Ningún audio pasa por git (ver CLAUDE.md, "Música: archivos de audio").
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { parseFile } from "music-metadata";
import { armarSlug, portadas } from "../src/lib/redaccion.js";

const [rutaLista] = process.argv.slice(2);
if (!rutaLista) {
  console.error("Falta la lista: node --env-file=.env.local scripts/cargar-musica.mjs <lista.json>");
  process.exit(1);
}
if (!process.env.SUPABASE_SECRET_KEY) {
  console.error("Falta SUPABASE_SECRET_KEY en .env.local.");
  process.exit(1);
}

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

const lista = JSON.parse(readFileSync(rutaLista, "utf8"));

/** Devuelve el id de la ficha del artista; la crea si no existe. */
async function fichaDe(nombre, genero) {
  const slug = armarSlug(nombre);
  const { data: existe } = await db.from("artistas").select("id").eq("slug", slug).maybeSingle();
  if (existe) return { id: existe.id, slug };

  const { data, error } = await db
    .from("artistas")
    .insert({ slug, nombre, genero, bio: "" })
    .select("id")
    .single();
  if (error) throw new Error(`No se pudo crear la ficha de ${nombre}: ${error.message}`);
  console.log(`  ficha nueva: ${nombre} (/artistas/${slug})`);
  return { id: data.id, slug };
}

// Al revés: el primero de la lista queda como el más nuevo, arriba de todo en
// Descubrimientos.
let subidos = 0;
for (const [i, tema] of lista.map((t, i) => [i, t]).reverse()) {
  const ficha = await fichaDe(tema.artista, tema.genero);
  const slug = `${ficha.slug}-${armarSlug(tema.titulo)}`;

  const { data: yaEsta } = await db.from("canciones").select("id").eq("slug", slug).maybeSingle();
  if (yaEsta) {
    console.log(`= ${tema.artista} — ${tema.titulo}: ya estaba`);
    continue;
  }

  const meta = await parseFile(tema.archivo, { duration: true, skipCovers: true });
  const duracion = Math.round(meta.format.duration ?? 0);
  const archivo = `semilla/${slug}.mp3`;

  const { error: errorSubida } = await db.storage
    .from("musica")
    .upload(archivo, readFileSync(tema.archivo), { contentType: "audio/mpeg", upsert: true });
  if (errorSubida) throw new Error(`No se pudo subir ${tema.titulo}: ${errorSubida.message}`);

  const { error } = await db.from("canciones").insert({
    slug,
    titulo: tema.titulo,
    artista_id: ficha.id,
    genero: tema.genero,
    duracion_seg: duracion,
    archivo,
    portada: portadas[i % portadas.length].clases,
  });
  if (error) {
    await db.storage.from("musica").remove([archivo]);
    throw new Error(`No se pudo guardar ${tema.titulo}: ${error.message}`);
  }

  subidos++;
  console.log(`+ ${tema.artista} — ${tema.titulo} (${Math.floor(duracion / 60)}:${String(duracion % 60).padStart(2, "0")})`);
}

console.log(`Listo: ${subidos} temas nuevos.`);
