import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticuloCard from "@/components/ArticuloCard";
import EventoCard from "@/components/EventoCard";
import {
  getArticulosDeArtista,
  getArtista,
  getEventosDeArtista,
  getTodosLosArtistas,
} from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const artistas = await getTodosLosArtistas();
  return artistas.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artista = await getArtista(slug);

  if (!artista) return { title: "Artista no encontrado" };

  return { title: artista.nombre, description: artista.bio };
}

export default async function ArtistaPage({ params }: Props) {
  const { slug } = await params;
  const artista = await getArtista(slug);

  if (!artista) notFound();

  const [notas, fechas] = await Promise.all([
    getArticulosDeArtista(slug),
    getEventosDeArtista(slug),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-sm uppercase tracking-wider text-accent">
        {artista.genero}
      </p>
      <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
        {artista.nombre}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        {artista.bio}
      </p>

      {fechas.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-sm uppercase tracking-wider text-muted">
            Próximas fechas
          </h2>
          <div className="flex flex-col gap-3">
            {fechas.map((e) => (
              <EventoCard key={e.slug} evento={e} />
            ))}
          </div>
        </section>
      )}

      {notas.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-sm uppercase tracking-wider text-muted">
            En la revista
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {notas.map((a) => (
              <ArticuloCard key={a.slug} articulo={a} />
            ))}
          </div>
        </section>
      )}

      <Link
        href="/agenda"
        className="mt-12 inline-block text-sm text-accent hover:opacity-80"
      >
        ← Volver a la agenda
      </Link>
    </div>
  );
}
