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
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="mb-4 inline-block -rotate-2 bg-acido px-2 font-titular text-sm uppercase tracking-widest text-tinta">
        {artista.genero}
      </p>
      <h1 className="corrido font-titular text-6xl uppercase leading-[0.9] tracking-tight text-papel sm:text-8xl">
        {artista.nombre}
      </h1>

      <div className="cinta mt-10 max-w-2xl rotate-1">
        <p className="papel roto p-6 pb-9 text-lg leading-snug shadow-[6px_6px_0_rgba(0,0,0,0.6)]">
          {artista.bio}
        </p>
      </div>

      {fechas.length > 0 && (
        <section className="mt-20">
          <TituloSeccion titulo="Próximas fechas" />
          <div className="flex flex-col gap-5">
            {fechas.map((e, i) => (
              <EventoCard key={e.slug} evento={e} indice={i} />
            ))}
          </div>
        </section>
      )}

      {notas.length > 0 && (
        <section className="mt-20">
          <TituloSeccion titulo="En la revista" />
          <div className="grid gap-10 sm:grid-cols-2">
            {notas.map((a, i) => (
              <ArticuloCard key={a.slug} articulo={a} indice={i} />
            ))}
          </div>
        </section>
      )}

      <Link
        href="/agenda"
        className="mt-14 inline-block font-marcador text-lg text-acido underline decoration-wavy underline-offset-4 hover:text-papel"
      >
        ← volver a la agenda
      </Link>
    </div>
  );
}
