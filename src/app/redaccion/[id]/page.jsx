import Link from "next/link";
import { notFound } from "next/navigation";
import EditorNota from "@/components/EditorNota";
import Titular from "@/components/Titular";
import { parrafosATexto } from "@/lib/redaccion";
import { exigirRedaccion } from "@/lib/sesion";

export const metadata = { title: "Editar nota" };

const avisos = {
  borrador: "Borrador guardado. Seguí cuando quieras.",
  publicada: "Nota publicada. Ya está en la revista.",
};

export default async function EditarNotaPage({ params, searchParams }) {
  const { id } = await params;
  const { guardada } = await searchParams;
  const { supabase, user, perfil } = await exigirRedaccion(`/redaccion/${id}`);
  const esAdmin = perfil.rol === "admin";

  const { data: nota } = await supabase
    .from("articulos")
    .select(
      "id, slug, titulo, bajada, cuerpo, categoria, firma, fecha, portada, portada_url, premium, destacado, estado, autor_id, artistas_mencionados, articulo_artistas ( artistas ( nombre ) )",
    )
    .eq("id", Number(id) || 0)
    .maybeSingle();

  // Un publicador ve las notas publicadas de otros, pero no las puede editar.
  if (!nota || (!esAdmin && nota.autor_id !== user.id)) notFound();

  const { data: artistas } = await supabase.from("artistas").select("slug, nombre").order("nombre");

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <header className="mb-10">
        <Link href="/redaccion" className="etiqueta text-cobalto transition-colors hover:bg-cobalto hover:text-white">
          ← Redacción
        </Link>
        <h1 className="mt-6 text-4xl sm:text-5xl">
          <Titular texto="Editar nota" />
        </h1>
      </header>

      <EditorNota
        nota={{
          ...nota,
          cuerpo: parrafosATexto(nota.cuerpo),
          // Los con ficha y los escritos a mano, todos como nombres.
          artistas: [
            ...nota.articulo_artistas.map((r) => r.artistas.nombre),
            ...nota.artistas_mencionados,
          ],
        }}
        artistas={artistas ?? []}
        esAdmin={esAdmin}
        aviso={avisos[guardada]}
      />
    </div>
  );
}
