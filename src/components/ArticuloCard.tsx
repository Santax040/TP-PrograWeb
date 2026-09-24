import Link from "next/link";
import type { Articulo } from "@/lib/types";
import { categorias } from "@/lib/site";
import { formatearFecha } from "@/lib/formato";

type Props = {
  articulo: Articulo;
  /** La variante destacada se usa en la portada, con más aire y tipografía grande. */
  destacado?: boolean;
};

export default function ArticuloCard({ articulo, destacado = false }: Props) {
  const categoria = categorias.find((c) => c.slug === articulo.categoria);

  return (
    <article className="group overflow-hidden rounded-xl border border-borde bg-surface transition-colors hover:border-accent">
      <Link href={`/notas/${articulo.slug}`} className="block">
        <div
          className={`bg-gradient-to-br ${articulo.portada} ${
            destacado ? "h-56" : "h-36"
          }`}
        />

        <div className="flex flex-col gap-2 p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent">
            <span>{categoria?.nombre}</span>
            {articulo.premium && (
              <span className="rounded border border-accent px-1.5 py-0.5 text-[10px]">
                Suscriptores
              </span>
            )}
          </div>

          <h3
            className={`font-bold leading-tight group-hover:text-accent ${
              destacado ? "text-2xl" : "text-lg"
            }`}
          >
            {articulo.titulo}
          </h3>

          <p className="text-sm leading-relaxed text-muted">{articulo.bajada}</p>

          <p className="mt-2 text-xs text-muted">
            {formatearFecha(articulo.fecha)} · {articulo.minutosLectura} min de
            lectura
          </p>
        </div>
      </Link>
    </article>
  );
}
