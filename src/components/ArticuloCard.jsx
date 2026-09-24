import Link from "next/link";
import { categorias } from "@/lib/site";
import { formatearFecha } from "@/lib/formato";

/** Giros leves para que las hojas parezcan pegadas a mano, no alineadas. */
const giros = ["-rotate-1", "rotate-1", "rotate-[0.5deg]", "-rotate-[1.5deg]", "rotate-[1.5deg]"];

/**
 * @param {Object} props
 * @param {import("@/lib/data").Articulo} props.articulo
 * @param {boolean} [props.destacado] - Variante de portada: más aire y tipografía grande.
 * @param {number} [props.indice] - Posición en la grilla. Solo define el giro de la hoja.
 */
export default function ArticuloCard({ articulo, destacado = false, indice = 0 }) {
  const categoria = categorias.find((c) => c.slug === articulo.categoria);

  return (
    <article
      className={`cinta transition-transform duration-200 hover:z-10 hover:rotate-0 hover:scale-[1.02] ${giros[indice % giros.length]}`}
    >
      <Link href={`/notas/${articulo.slug}`} className="group block">
        <div className="papel roto shadow-[6px_6px_0_rgba(0,0,0,0.6)]">
          <div
            className={`fotocopia relative bg-gradient-to-br ${articulo.portada} ${
              destacado ? "h-64 sm:h-80" : "h-40"
            }`}
          >
            <span className="absolute left-3 top-3 z-[1] bg-tinta px-2 py-0.5 font-titular text-xs uppercase tracking-widest text-papel">
              {categoria?.nombre}
            </span>
            {articulo.premium && (
              <span className="sello absolute bottom-3 right-3 z-[1] bg-papel/85 text-xs">
                Solo suscriptores
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 p-5 pb-7">
            <h3
              className={`font-titular uppercase leading-[0.95] tracking-tight ${
                destacado ? "text-4xl sm:text-5xl" : "text-2xl"
              }`}
            >
              <span className="group-hover:marcado">{articulo.titulo}</span>
            </h3>

            <p className={`leading-snug text-tinta/80 ${destacado ? "text-lg" : "text-sm"}`}>
              {articulo.bajada}
            </p>

            <p className="border-t border-dashed border-tinta/40 pt-2 text-xs uppercase tracking-wider text-gris">
              {formatearFecha(articulo.fecha)} / {articulo.minutosLectura} min
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
