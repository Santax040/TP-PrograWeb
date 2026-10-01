import Link from "next/link";
import { notFound } from "next/navigation";
import ArticuloCard from "@/components/ArticuloCard";
import EventoCard from "@/components/EventoCard";
import TituloSeccion from "@/components/TituloSeccion";
import {
  getArticulosDeArtista,
  getArtista,
  getEventosDeArtista,
  getTodosLosArtistas,
} from "@/lib/data";

// Vuelve a consultar la base como mucho una vez por minuto.
export const revalidate = 60;

export async function generateStaticParams() {
  const artistas = await getTodosLosArtistas();
  return artistas.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const artista = await getArtista(slug);

  if (!artista) return { title: "Artista no encontrado" };

  return { title: artista.nombre, description: artista.bio };
}

export default async function ArtistaPage({ params }) {
  const { slug } = await params;
  const artista = await getArtista(slug);

  if (!artista) notFound();

  const [notas, fechas] = await Promise.all([
    getArticulosDeArtista(slug),
    getEventosDeArtista(slug),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <header className="cartel relative overflow-hidden px-6 py-12 sm:px-12">
        <p className="font-ancha text-[0.65rem] uppercase text-white/80">
          {artista.genero}
        </p>
        <h1 className="titular-apretado resplandor mt-6 font-titular text-5xl font-extralight lowercase sm:text-7xl">
          {artista.nombre}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/85">{artista.bio}</p>
      </header>

      {fechas.length > 0 && (
        <section className="mt-20">
          <TituloSeccion titulo="Próximas fechas" />
          <div className="flex flex-col gap-4">
            {fechas.map((e) => (
              <EventoCard key={e.slug} evento={e} />
            ))}
          </div>
        </section>
      )}

      {notas.length > 0 && (
        <section className="mt-20">
          <TituloSeccion titulo="En la revista" />
          <div className="grid gap-8 sm:grid-cols-2">
            {notas.map((a) => (
              <ArticuloCard key={a.slug} articulo={a} />
            ))}
          </div>
        </section>
      )}

      <Link
        href="/agenda"
        className="etiqueta mt-16 text-cobalto transition-colors hover:bg-cobalto hover:text-white"
      >
        ← Volver a la agenda
      </Link>
    </div>
  );
}
