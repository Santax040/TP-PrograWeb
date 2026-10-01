import Link from "next/link";
import { formatearPrecio } from "@/lib/formato";

/**
 * Evento con forma de renglón de tablero de salidas: la fecha en un bloque
 * cobalto a la izquierda, como el número de puerta, y el resto al lado.
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
      <div className="cartel m-2 flex w-20 shrink-0 flex-col items-center justify-center py-4">
        <span className="font-titular text-3xl font-extralight leading-none">{dia}</span>
        <span className="mt-1.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/75">
          {mes}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-titular text-xl font-light lowercase text-marino transition-colors group-hover:text-cobalto">
            {evento.nombre}
          </h3>
          <p className="mt-1 truncate font-mono text-[0.68rem] uppercase tracking-[0.14em] text-humo">
            {evento.lugar} · {evento.ciudad}
          </p>
        </div>

        <span className="etiqueta hidden shrink-0 text-cobalto sm:inline-block">
          {formatearPrecio(evento.precioDesde)}
        </span>
      </div>
    </Link>
  );
}
