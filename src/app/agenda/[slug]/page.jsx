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
          <span className="absolute left-5 top-5 z-[1] bg-vidrio/90 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-pizarra">
            {evento.genero}
          </span>
        </div>

        <div className="px-6 py-12 sm:px-12">
          <h1 className="titular-apretado font-titular text-3xl font-semibold text-pizarra sm:text-5xl">
            {evento.nombre}
          </h1>

          <ul className="mt-12 flex flex-col gap-2 border-y border-hormigon py-10">
            {ordenado.map((a, i) => (
              <li key={a.slug}>
                <Link
                  href={`/artistas/${a.slug}`}
                  className={`titular-apretado font-titular font-semibold text-pizarra transition-colors hover:text-agua ${
                    tamanosLineup[Math.min(i, tamanosLineup.length - 1)]
                  }`}
                >
                  {a.nombre}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-10 max-w-lg text-lg leading-relaxed text-acero">{evento.descripcion}</p>

          <dl className="mt-12 grid gap-px border border-hormigon bg-hormigon sm:grid-cols-3">
            <div className="bg-vidrio p-5">
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-acero">
                Fecha
              </dt>
              <dd className="mt-2 font-titular text-base text-pizarra">
                {formatearFecha(evento.fecha)}
              </dd>
            </div>
            <div className="bg-vidrio p-5">
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-acero">
                Dónde
              </dt>
              <dd className="mt-2 font-titular text-base text-pizarra">
                {evento.lugar}, {evento.ciudad}
              </dd>
            </div>
            <div className="bg-vidrio p-5">
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-acero">
                Entradas desde
              </dt>
              <dd className="mt-2 font-mono text-xl text-agua">
                {formatearPrecio(evento.precioDesde)}
              </dd>
            </div>
          </dl>
        </div>
      </article>

      <Link
        href="/agenda"
        className="mt-14 inline-block font-mono text-xs uppercase tracking-[0.18em] text-acero transition-colors hover:text-agua"
      >
        ← Volver a la agenda
      </Link>
    </div>
  );
}
