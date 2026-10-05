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
      <div className="bruma h-64 sm:h-[28rem]">
        <div className={`h-full w-full bg-gradient-to-br ${articulo.portada}`} />
      </div>

      <div className="mx-auto max-w-3xl px-4">
        <header className="tarjeta relative z-[1] -mt-24 px-6 py-10 sm:-mt-32 sm:px-10">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/notas/categoria/${articulo.categoria}`}
              className="etiqueta text-cobalto transition-colors hover:bg-cobalto hover:text-white"
            >
              {categoria?.nombre}
            </Link>
            {articulo.premium && (
              <Link
                href="/suscribite"
                className="etiqueta text-lavanda transition-colors hover:bg-lavanda hover:text-white"
              >
                Suscriptores
              </Link>
            )}
          </div>

          <h1 className="titular-apretado mt-7 font-titular text-4xl font-light text-marino sm:text-6xl">
            {articulo.titulo}
          </h1>

          <p className="mt-7 text-xl leading-relaxed text-humo">{articulo.bajada}</p>

          <p className="mt-8 border-t border-white/80 pt-5 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-cobalto">
            {articulo.autor} · {formatearFecha(articulo.fecha)} · {articulo.minutosLectura} min
          </p>
        </header>

        {/* Mientras no haya pagos, la nota premium se lee completa, pero se
            avisa y se ofrece el camino para suscribirse. */}
        {articulo.premium && !pagosActivos && (
          <aside className="cartel mt-12 px-6 py-5">
            <p className="font-titular text-lg font-light">
              Nota exclusiva, abierta por ahora
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              Cuando se activen los pagos va a ser solo para suscriptores.{" "}
              <Link href="/suscribite" className="text-cian underline underline-offset-4">
                Mirá los planes →
              </Link>
            </p>
          </aside>
        )}

        <div className="mt-12 flex flex-col gap-6 text-lg leading-[1.75] text-marino">
          {articulo.cuerpo.map((parrafo, i) => (
            <p key={i} className={i === 0 ? "capitular" : undefined}>
              {parrafo}
            </p>
          ))}
        </div>

        {artistas.length > 0 && (
          <section className="mt-20 border-t border-white/80 pt-10">
            <h2 className="mb-6 font-ancha text-[0.65rem] uppercase text-cobalto">
              Aparecen en esta nota
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {artistas.map((a) => (
                <Link key={a.slug} href={`/artistas/${a.slug}`} className="tarjeta block px-5 py-4">
                  <p className="font-titular text-xl font-light text-marino">{a.nombre}</p>
                  <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-cobalto">
                    {a.genero}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Link
          href="/notas"
          className="etiqueta mt-16 text-cobalto transition-colors hover:bg-cobalto hover:text-white"
        >
          ← Volver a las notas
        </Link>
      </div>
    </article>
  );
}
