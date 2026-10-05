import Link from "next/link";
/**
 * Evento como un renglón del HUD: la fecha como rótulo dentro de un marco blanco,
 * el nombre al lado y el género a la derecha. Sin precio: la revista anuncia
 * las fechas, no vende entradas.
 *
 * @param {Object} props
 * @param {import("@/lib/data").Evento} props.evento
 */
export default function EventoCard({ evento }) {
  const [anio, mes, dia] = evento.fecha.split("-");

  return (
    <Link
      href={`/agenda/${evento.slug}`}
      className="group flex items-center gap-4 border-b border-white/70 py-4 transition-colors hover:border-white"
    >
      <span className="shrink-0 border border-white px-2.5 py-1.5 text-center rotulo text-sm leading-tight text-marino group-hover:bg-white">
        {dia}.{mes}
        <span className="block text-xs text-humo">{anio}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-lg font-medium text-marino group-hover:text-cobalto">
          {evento.nombre}
        </span>
        <span className="block truncate rotulo text-xs uppercase text-humo">
          {evento.lugar}, {evento.ciudad}
        </span>
      </span>
      <span className="etiqueta hidden shrink-0 text-humo sm:inline-block">{evento.genero}</span>
    </Link>
  );
}
