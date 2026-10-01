import Link from "next/link";
import { formatearPrecio } from "@/lib/formato";

/**
 * Evento con forma de renglón de cartel de salidas: la fecha a la izquierda,
 * separada por una línea fina, y el resto de los datos alineados al lado.
 *
 * @param {Object} props
 * @param {import("@/lib/data").Evento} props.evento
 */
export default function EventoCard({ evento }) {
  const fecha = new Date(`${evento.fecha}T00:00:00Z`);
  const dia = fecha.getUTCDate().toString().padStart(2, "0");
  const mes = fecha
    .toLocaleDateString("es-AR", { month: "short", timeZone: "UTC" })
    .replace(".", "");

  return (
    <Link href={`/agenda/${evento.slug}`} className="tarjeta group flex items-stretch">
      <div className="flex w-24 shrink-0 flex-col items-center justify-center border-r border-hormigon py-5">
        <span className="font-mono text-3xl leading-none text-pizarra">{dia}</span>
        <span className="mt-1.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-acero">
          {mes}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-titular text-lg font-semibold text-pizarra transition-colors group-hover:text-agua">
            {evento.nombre}
          </h3>
          <p className="mt-1 truncate font-mono text-[0.68rem] uppercase tracking-[0.14em] text-acero">
            {evento.lugar} · {evento.ciudad}
          </p>
        </div>

        <span className="etiqueta hidden shrink-0 text-acero sm:inline-block">
          {formatearPrecio(evento.precioDesde)}
        </span>
      </div>
    </Link>
  );
}
