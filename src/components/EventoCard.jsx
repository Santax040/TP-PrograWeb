import Link from "next/link";
import { formatearPrecio } from "@/lib/formato";

const giros = ["-rotate-[0.6deg]", "rotate-[0.4deg]", "rotate-[0.8deg]", "-rotate-[0.3deg]"];

/** Evento con forma de entrada: talón con la fecha, línea troquelada y cuerpo. */
/**
 * @param {Object} props
 * @param {import("@/lib/data").Evento} props.evento
 * @param {number} [props.indice] - Posición en la lista. Solo define el giro.
 */
export default function EventoCard({ evento, indice = 0 }) {
  const fecha = new Date(`${evento.fecha}T00:00:00Z`);
  const dia = fecha.getUTCDate().toString().padStart(2, "0");
  const mes = fecha.toLocaleDateString("es-AR", { month: "short", timeZone: "UTC" }).replace(".", "");

  return (
    <Link
      href={`/agenda/${evento.slug}`}
      className={`group flex shadow-[5px_5px_0_rgba(0,0,0,0.6)] transition-transform duration-200 hover:rotate-0 hover:scale-[1.01] ${giros[indice % giros.length]}`}
    >
      <div className="flex w-20 shrink-0 flex-col items-center justify-center border-r-2 border-dashed border-tinta bg-acido py-3 text-tinta">
        <span className="font-titular text-4xl leading-none">{dia}</span>
        <span className="font-titular text-sm uppercase tracking-widest">{mes}</span>
      </div>

      <div className="papel flex min-w-0 flex-1 items-center gap-4 px-4 py-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-titular text-xl uppercase leading-tight group-hover:text-sangre">
            {evento.nombre}
          </h3>
          <p className="truncate text-sm text-tinta/75">
            {evento.lugar} / {evento.ciudad}
          </p>
        </div>

        <span className="sello hidden shrink-0 text-sm sm:inline-block">
          {formatearPrecio(evento.precioDesde)}
        </span>
      </div>
    </Link>
  );
}
