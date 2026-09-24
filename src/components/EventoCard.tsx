import Link from "next/link";
import type { Evento } from "@/lib/types";
import { formatearFechaCorta, formatearPrecio } from "@/lib/formato";

export default function EventoCard({ evento }: { evento: Evento }) {
  return (
    <Link
      href={`/agenda/${evento.slug}`}
      className="group flex items-center gap-4 rounded-xl border border-borde bg-surface p-4 transition-colors hover:border-accent"
    >
      <div
        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-center text-xs font-bold uppercase leading-tight ${evento.portada}`}
      >
        {formatearFechaCorta(evento.fecha)}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-bold group-hover:text-accent">
          {evento.nombre}
        </h3>
        <p className="truncate text-sm text-muted">
          {evento.lugar} · {evento.ciudad}
        </p>
      </div>

      <div className="shrink-0 text-right text-sm">
        <p className="text-muted">Desde</p>
        <p className="font-medium">{formatearPrecio(evento.precioDesde)}</p>
      </div>
    </Link>
  );
}
