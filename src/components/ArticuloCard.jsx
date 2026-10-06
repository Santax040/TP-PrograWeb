import Link from "next/link";
import FondoPortada from "@/components/FondoPortada";
import { categorias } from "@/lib/site";
import { formatearFecha } from "@/lib/formato";

/**
 * Nota como una capa de vidrio del collage: foto menta arriba, datos abajo.
 * Al pasar por encima aparece el marco corrido del HUD.
 *
 * @param {Object} props
 * @param {import("@/lib/data").Articulo} props.articulo
 * @param {boolean} [props.destacado]
 */
export default function ArticuloCard({ articulo, destacado = false }) {
  const categoria = categorias.find((c) => c.slug === articulo.categoria);

  return (
    <article className="tarjeta h-full">
      <Link href={`/notas/${articulo.slug}`} className="group flex h-full flex-col">
        <div className={`bruma relative ${destacado ? "h-72 sm:h-96" : "h-44"}`}>
          <FondoPortada
            articulo={articulo}
            sizes={destacado ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
          />
          <span className="etiqueta absolute left-3 top-3 z-[2] text-white">{categoria?.nombre}</span>
          {articulo.premium && (
            <span className="cartel absolute bottom-3 right-3 z-[2] px-2 py-0.5 rotulo text-xs uppercase">
              Suscriptores
            </span>
          )}
        </div>

        <div className={`flex flex-1 flex-col gap-3 ${destacado ? "p-7 sm:p-9" : "p-5"}`}>
          <h3
            className={`titular-apretado font-medium text-marino ${
              destacado ? "text-3xl sm:text-4xl" : "text-xl"
            }`}
          >
            <span className="subrayado group-hover:subrayado-activo">{articulo.titulo}</span>
          </h3>
          <p className={`leading-relaxed text-humo ${destacado ? "text-base" : "text-sm"}`}>
            {articulo.bajada}
          </p>
          <p className="mt-auto flex justify-between gap-4 pt-3 rotulo text-xs uppercase text-humo">
            <span>{formatearFecha(articulo.fecha)}</span>
            <span>{articulo.minutosLectura} min</span>
          </p>
        </div>
      </Link>
    </article>
  );
}
