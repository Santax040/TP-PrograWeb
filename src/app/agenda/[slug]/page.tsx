import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArtistas, getEvento, getEventos } from "@/lib/data";
import { formatearFecha, formatearPrecio } from "@/lib/formato";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const eventos = await getEventos();
  return eventos.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const evento = await getEvento(slug);

  if (!evento) return { title: "Evento no encontrado" };

  return { title: evento.nombre, description: evento.descripcion };
}

export default async function EventoPage({ params }: Props) {
  const { slug } = await params;
  const evento = await getEvento(slug);

  if (!evento) notFound();

  const lineup = await getArtistas(evento.lineup);

  return (
    <article>
      <div className={`h-52 bg-gradient-to-br sm:h-72 ${evento.portada}`} />

      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm uppercase tracking-wider text-accent">
          {evento.genero}
        </p>

        <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
          {evento.nombre}
        </h1>

        <dl className="mt-8 grid gap-4 rounded-xl border border-borde bg-surface p-6 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">
              Fecha
            </dt>
            <dd className="mt-1 font-medium">{formatearFecha(evento.fecha)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">
              Dónde
            </dt>
            <dd className="mt-1 font-medium">
              {evento.lugar}, {evento.ciudad}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">
              Entradas desde
            </dt>
            <dd className="mt-1 font-medium">
              {formatearPrecio(evento.precioDesde)}
            </dd>
          </div>
        </dl>

        <p className="mt-8 text-lg leading-relaxed">{evento.descripcion}</p>

        <section className="mt-12 border-t border-borde pt-8">
          <h2 className="mb-4 text-sm uppercase tracking-wider text-muted">
            Line-up
          </h2>
          <div className="flex flex-col gap-3">
            {lineup.map((a) => (
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

        <Link
          href="/agenda"
          className="mt-12 inline-block text-sm text-accent hover:opacity-80"
        >
          ← Volver a la agenda
        </Link>
      </div>
    </article>
  );
}
