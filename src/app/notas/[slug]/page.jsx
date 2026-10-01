import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticulo, getArticulos, getArtistas } from "@/lib/data";
import { categorias, pagosActivos } from "@/lib/site";
import { formatearFecha } from "@/lib/formato";

// Vuelve a consultar la base como mucho una vez por minuto.
export const revalidate = 60;

/**
 * Le dice a Next qué notas existen, para generarlas como HTML estático
 * durante el build en vez de armarlas en cada visita.
 */
export async function generateStaticParams() {
  const articulos = await getArticulos();
  return articulos.map((a) => ({ slug: a.slug }));
}

/** Título y descripción propios de cada nota, para buscadores y al compartir. */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const articulo = await getArticulo(slug);

  if (!articulo) return { title: "Nota no encontrada" };

  return { title: articulo.titulo, description: articulo.bajada };
}

export default async function NotaPage({ params }) {
  const { slug } = await params;
  const articulo = await getArticulo(slug);

  // Si el slug de la URL no existe, Next muestra la pantalla 404.
  if (!articulo) notFound();

  const categoria = categorias.find((c) => c.slug === articulo.categoria);
  const artistas = await getArtistas(articulo.artistas);

  return (
    <article className="pb-12">
      <div className="bruma h-64 sm:h-96">
        <div className={`h-full w-full bg-gradient-to-br ${articulo.portada}`} />
      </div>

      <div className="mx-auto max-w-3xl px-4">
        <header className="border-b border-hormigon py-12">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/notas/categoria/${articulo.categoria}`}
              className="etiqueta text-acero transition-colors hover:text-agua"
            >
              {categoria?.nombre}
            </Link>
            {articulo.premium && (
              <Link
                href="/suscribite"
                className="etiqueta text-musgo transition-colors hover:text-agua"
              >
                Suscriptores
              </Link>
            )}
          </div>

          <h1 className="titular-apretado mt-7 font-titular text-4xl font-semibold text-pizarra sm:text-6xl">
            {articulo.titulo}
          </h1>

          <p className="mt-7 text-xl leading-relaxed text-acero">{articulo.bajada}</p>

          <p className="mt-8 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-acero">
            {articulo.autor} · {formatearFecha(articulo.fecha)} · {articulo.minutosLectura} min
          </p>
        </header>

        {/* Mientras no haya pagos, la nota premium se lee completa, pero se
            avisa y se ofrece el camino para suscribirse. */}
        {articulo.premium && !pagosActivos && (
          <aside className="mt-12 border-l-2 border-agua bg-vidrio px-5 py-4">
            <p className="font-titular text-sm uppercase tracking-[0.1em] text-pizarra">
              Nota exclusiva, abierta por ahora
            </p>
            <p className="mt-2 text-sm leading-relaxed text-acero">
              Cuando se activen los pagos va a ser solo para suscriptores.{" "}
              <Link href="/suscribite" className="text-agua underline underline-offset-4">
                Mirá los planes →
              </Link>
            </p>
          </aside>
        )}

        <div className="mt-12 flex flex-col gap-6 text-lg leading-[1.75] text-pizarra">
          {articulo.cuerpo.map((parrafo, i) => (
            <p key={i} className={i === 0 ? "capitular" : undefined}>
              {parrafo}
            </p>
          ))}
        </div>

        {artistas.length > 0 && (
          <section className="mt-20 border-t border-hormigon pt-10">
            <h2 className="mb-6 font-mono text-xs uppercase tracking-[0.22em] text-acero">
              Aparecen en esta nota
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {artistas.map((a) => (
                <Link key={a.slug} href={`/artistas/${a.slug}`} className="tarjeta block px-5 py-4">
                  <p className="font-titular text-lg font-semibold text-pizarra">{a.nombre}</p>
                  <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-acero">
                    {a.genero}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Link
          href="/notas"
          className="mt-16 inline-block font-mono text-xs uppercase tracking-[0.18em] text-acero transition-colors hover:text-agua"
        >
          ← Volver a las notas
        </Link>
      </div>
    </article>
  );
}
