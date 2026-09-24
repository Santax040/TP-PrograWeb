import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticulo, getArticulos, getArtistas } from "@/lib/data";
import { categorias, pagosActivos } from "@/lib/site";
import { formatearFecha } from "@/lib/formato";

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
    <article className="pb-8">
      <div className={`fotocopia roto h-56 bg-gradient-to-br sm:h-80 ${articulo.portada}`} />

      <div className="mx-auto -mt-24 max-w-3xl px-4 sm:-mt-32">
        <div className="cinta -rotate-[0.6deg]">
          <div className="papel roto px-6 pb-12 pt-8 shadow-[8px_8px_0_rgba(0,0,0,0.7)] sm:px-12">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/notas/categoria/${articulo.categoria}`}
                className="bg-tinta px-2 py-0.5 font-titular text-xs uppercase tracking-widest text-papel hover:bg-sangre"
              >
                {categoria?.nombre}
              </Link>
              {articulo.premium && (
                <Link href="/suscribite" className="sello text-xs hover:bg-sangre hover:text-papel">
                  Solo suscriptores
                </Link>
              )}
            </div>

            <h1 className="mt-5 font-titular text-4xl uppercase leading-[0.92] tracking-tight sm:text-6xl">
              {articulo.titulo}
            </h1>

            <p className="mt-6 text-xl italic leading-snug">
              <span className="marcado">{articulo.bajada}</span>
            </p>

            <p className="mt-6 border-y-2 border-dashed border-tinta/40 py-2 text-xs uppercase tracking-wider text-gris">
              Por {articulo.autor} / {formatearFecha(articulo.fecha)} /{" "}
              {articulo.minutosLectura} min de lectura
            </p>

            {/* Mientras no haya pagos, la nota premium se lee completa, pero se
                avisa y se ofrece el camino para suscribirse. */}
            {articulo.premium && !pagosActivos && (
              <aside className="mt-6 -rotate-1 bg-acido p-4 leading-snug text-tinta shadow-[4px_4px_0_var(--tinta)]">
                <p className="font-titular uppercase">Nota exclusiva, gratis por ahora</p>
                <p className="mt-1 text-sm">
                  Cuando se activen los pagos va a ser solo para suscriptores.{" "}
                  <Link href="/suscribite" className="font-bold underline underline-offset-2 hover:text-sangre">
                    Mirá los planes →
                  </Link>
                </p>
              </aside>
            )}

            <div className="mt-8 flex flex-col gap-5 text-lg leading-relaxed">
              {articulo.cuerpo.map((parrafo, i) => (
                <p key={i} className={i === 0 ? "capitular" : undefined}>
                  {parrafo}
                </p>
              ))}
            </div>

            <p className="mt-10 text-right font-marcador text-2xl text-sangre">
              — fin —
            </p>
          </div>
        </div>

        {artistas.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 -rotate-1 font-marcador text-2xl text-acido">
              aparecen en esta nota:
            </h2>
            <div className="flex flex-wrap gap-4">
              {artistas.map((a, i) => (
                <Link
                  key={a.slug}
                  href={`/artistas/${a.slug}`}
                  className={`papel block px-4 py-3 shadow-[4px_4px_0_var(--sangre)] transition-transform hover:rotate-0 ${
                    i % 2 === 0 ? "-rotate-2" : "rotate-2"
                  }`}
                >
                  <p className="font-titular text-xl uppercase">{a.nombre}</p>
                  <p className="text-xs uppercase tracking-wider text-gris">{a.genero}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Link
          href="/notas"
          className="mt-14 inline-block font-marcador text-lg text-acido underline decoration-wavy underline-offset-4 hover:text-papel"
        >
          ← volver a las notas
        </Link>
      </div>
    </article>
  );
}
