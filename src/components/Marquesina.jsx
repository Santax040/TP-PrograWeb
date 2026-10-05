import Link from "next/link";
import { getEventos } from "@/lib/data";

/**
 * El cartel de LED del andén: las próximas fechas en mono, pasando sobre una
 * franja agua translúcida.
 */
export default async function Marquesina() {
  const eventos = await getEventos();

  const renglon = (copia) =>
    eventos.slice(0, 6).map((e) => (
      <Link
        key={`${copia}-${e.slug}`}
        href={`/agenda/${e.slug}`}
        tabIndex={copia === 0 ? 0 : -1}
        aria-hidden={copia === 1}
        className="flex shrink-0 gap-3 whitespace-nowrap px-6 hover:text-marino"
      >
        <span className="text-marino/70">{e.fecha.replaceAll("-", ".")}</span>
        <span>{e.nombre}</span>
      </Link>
    ));

  return (
    <div className="relative z-10 overflow-hidden border-b border-white/70 bg-cian/50 py-2 font-mono text-sm uppercase text-white backdrop-blur-sm">
      <div className="marquesina">
        {renglon(0)}
        {renglon(1)}
      </div>
    </div>
  );
}
