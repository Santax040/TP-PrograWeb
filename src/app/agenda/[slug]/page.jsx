import Link from "next/link";
import { notFound } from "next/navigation";
import { getArtistas, getEvento, getEventos } from "@/lib/data";
import { formatearFecha, formatearPrecio } from "@/lib/formato";

/** Tamaños del line-up, de mayor a menor, como en los afiches de festival. */
const tamanosLineup = ["text-5xl sm:text-7xl", "text-4xl sm:text-5xl", "text-3xl sm:text-4xl"];

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
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="cinta rotate-[0.8deg]">
        <div className="papel roto shadow-[8px_8px_0_rgba(0,0,0,0.7)]">
          <div className={`fotocopia relative h-48 bg-gradient-to-br sm:h-64 ${evento.portada}`}>
            <span className="absolute left-4 top-4 z-[1] bg-tinta px-2 py-0.5 font-titular text-xs uppercase tracking-widest text-acido">
              {evento.genero}
            </span>
          </div>

          <div className="px-6 pb-12 pt-8 text-center sm:px-12">
            <h1 className="font-titular text-4xl uppercase leading-[0.92] tracking-tight sm:text-6xl">
              {evento.nombre}
            </h1>

            <ul className="mt-10 flex flex-col items-center gap-1">
              {ordenado.map((a, i) => (
                <li key={a.slug}>
                  <Link
                    href={`/artistas/${a.slug}`}
                    className={`font-titular uppercase leading-none hover:text-sangre ${
                      tamanosLineup[Math.min(i, tamanosLineup.length - 1)]
                    }`}
                  >
                    {a.nombre}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mx-auto mt-10 max-w-lg text-lg leading-snug">{evento.descripcion}</p>

            <dl className="mt-10 grid border-2 border-tinta text-left sm:grid-cols-3">
              <div className="border-b-2 border-dashed border-tinta p-4 sm:border-b-0 sm:border-r-2">
                <dt className="text-xs uppercase tracking-widest text-gris">Fecha</dt>
                <dd className="mt-1 font-titular text-lg uppercase">{formatearFecha(evento.fecha)}</dd>
              </div>
              <div className="border-b-2 border-dashed border-tinta p-4 sm:border-b-0 sm:border-r-2">
                <dt className="text-xs uppercase tracking-widest text-gris">Dónde</dt>
                <dd className="mt-1 font-titular text-lg uppercase">
                  {evento.lugar}, {evento.ciudad}
                </dd>
              </div>
              <div className="bg-acido p-4">
                <dt className="text-xs uppercase tracking-widest text-tinta/70">Entradas desde</dt>
                <dd className="mt-1 font-titular text-2xl">{formatearPrecio(evento.precioDesde)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <Link
        href="/agenda"
        className="mt-14 inline-block font-marcador text-lg text-acido underline decoration-wavy underline-offset-4 hover:text-papel"
      >
        ← volver a la agenda
      </Link>
    </div>
  );
}
