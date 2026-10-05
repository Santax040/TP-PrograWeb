import Link from "next/link";
import { notFound } from "next/navigation";
import { getArtistas, getEvento, getEventos } from "@/lib/data";
import { formatearFecha, formatearPrecio } from "@/lib/formato";

// Vuelve a consultar la base como mucho una vez por minuto.
export const revalidate = 60;

/** Tamaños del line-up, de mayor a menor: el cabeza de cartel primero. */
const tamanosLineup = ["text-4xl sm:text-6xl", "text-2xl sm:text-4xl", "text-xl sm:text-2xl"];

export async function generateStaticParams() {
  const eventos = await getEventos();
  return eventos.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const evento = await getEvento(slug);

  if (!evento) return { title: "Evento no encontrado" };

  return { title: evento.nombre, description: evento.descripcion };
}

export default async function EventoPage({ params }) {
  const { slug } = await params;
  const evento = await getEvento(slug);

  if (!evento) notFound();

  const lineup = await getArtistas(evento.lineup);
  // getArtistas no respeta el orden del line-up; lo restauramos para que
  // el cabeza de cartel quede primero y más grande.
  const ordenado = evento.lineup
    .map((s) => lineup.find((a) => a.slug === s))
    .filter((a) => a !== undefined);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <article className="tarjeta">
        <div className="bruma relative h-56 sm:h-72">
          <div className={`h-full w-full bg-gradient-to-br ${evento.portada}`} />
          <span className="absolute left-5 top-5 z-[2] border border-white/60 bg-white/25 px-3 py-1 font-ancha text-[0.6rem] uppercase text-white backdrop-blur-md">
            {evento.genero}
          </span>
        </div>

        <div className="px-6 py-12 sm:px-12">
          <h1 className="titular-apretado font-titular text-4xl font-light text-marino sm:text-6xl">
            {evento.nombre}
          </h1>

          <ul className="mt-12 flex flex-col gap-3 border-y border-white/80 py-10">
            {ordenado.map((a, i) => (
              <li key={a.slug}>
                <Link
                  href={`/artistas/${a.slug}`}
                  className={`titular-apretado font-titular font-light text-marino transition-colors hover:text-cobalto ${
                    tamanosLineup[Math.min(i, tamanosLineup.length - 1)]
                  }`}
                >
                  {a.nombre}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-10 max-w-lg text-lg leading-relaxed text-humo">{evento.descripcion}</p>

          <dl className="cartel mt-12 grid gap-px overflow-hidden sm:grid-cols-3">
            <div className="p-5">
              <dt className="font-ancha text-[0.55rem] uppercase text-white/70">
                Fecha
              </dt>
              <dd className="mt-2 font-titular text-base font-light">
                {formatearFecha(evento.fecha)}
              </dd>
            </div>
            <div className="p-5">
              <dt className="font-ancha text-[0.55rem] uppercase text-white/70">
                Dónde
              </dt>
              <dd className="mt-2 font-titular text-base font-light">
                {evento.lugar}, {evento.ciudad}
              </dd>
            </div>
            <div className="p-5">
              <dt className="font-ancha text-[0.55rem] uppercase text-white/70">
                Entradas desde
              </dt>
              <dd className="resplandor mt-2 font-mono text-xl text-cian">
                {formatearPrecio(evento.precioDesde)}
              </dd>
            </div>
          </dl>
        </div>
      </article>

      <Link
        href="/agenda"
        className="etiqueta mt-14 text-cobalto transition-colors hover:bg-cobalto hover:text-white"
      >
        ← Volver a la agenda
      </Link>
    </div>
  );
}
