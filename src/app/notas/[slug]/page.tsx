import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticulo, getArticulos, getArtistas } from "@/lib/data";
import { categorias } from "@/lib/site";
import { formatearFecha } from "@/lib/formato";

type Props = { params: Promise<{ slug: string }> };

/**
 * Le dice a Next qué notas existen, para generarlas como HTML estático
 * durante el build en vez de armarlas en cada visita.
 */
export async function generateStaticParams() {
  const articulos = await getArticulos();
  return articulos.map((a) => ({ slug: a.slug }));
}

/** Título y descripción propios de cada nota, para buscadores y al compartir. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const articulo = await getArticulo(slug);

  if (!articulo) return { title: "Nota no encontrada" };

  return { title: articulo.titulo, description: articulo.bajada };
}

export default async function NotaPage({ params }: Props) {
  const { slug } = await params;
  const articulo = await getArticulo(slug);

  // Si el slug de la URL no existe, Next muestra la pantalla 404.
  if (!articulo) notFound();

  const categoria = categorias.find((c) => c.slug === articulo.categoria);
  const artistas = await getArtistas(articulo.artistas);

  return (
    <article>
      <div className={`h-52 bg-gradient-to-br sm:h-72 ${articulo.portada}`} />

      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href={`/notas/categoria/${articulo.categoria}`}
          className="text-xs uppercase tracking-wider text-accent hover:opacity-80"
        >
          {categoria?.nombre}
        </Link>

        <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
          {articulo.titulo}
        </h1>

        <p className="mt-4 text-xl leading-relaxed text-muted">
          {articulo.bajada}
        </p>

        <p className="mt-6 border-b border-borde pb-6 text-sm text-muted">
          Por {articulo.autor} · {formatearFecha(articulo.fecha)} ·{" "}
          {articulo.minutosLectura} min de lectura
        </p>

        <div className="mt-8 flex flex-col gap-6 text-lg leading-relaxed">
          {articulo.cuerpo.map((parrafo, i) => (
            <p key={i}>{parrafo}</p>
          ))}
        </div>

        {artistas.length > 0 && (
          <section className="mt-12 border-t border-borde pt-8">
            <h2 className="mb-4 text-sm uppercase tracking-wider text-muted">
              Aparecen en esta nota
            </h2>
            <div className="flex flex-col gap-3">
              {artistas.map((a) => (
                <Link
                  key={a.slug}
                  href={`/artistas/${a.slug}`}
                  className="rounded-lg border border-borde bg-surface p-4 transition-colors hover:border-accent"
                >
                  <p className="font-bold">{a.nombre}</p>
                  <p className="text-sm text-muted">{a.genero}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Link
          href="/notas"
          className="mt-12 inline-block text-sm text-accent hover:opacity-80"
        >
          ← Volver a las notas
        </Link>
      </div>
    </article>
  );
}
