import Link from "next/link";
import { categorias } from "@/lib/site";
import { formatearFecha } from "@/lib/formato";

/**
 * @param {Object} props
 * @param {import("@/lib/data").Articulo} props.articulo
 * @param {boolean} [props.destacado] - Variante de portada: más aire y tipografía grande.
 */
export default function ArticuloCard({ articulo, destacado = false }) {
  const categoria = categorias.find((c) => c.slug === articulo.categoria);

  return (
    <article className="tarjeta h-full">
      <Link href={`/notas/${articulo.slug}`} className="group flex h-full flex-col">
        <div className={`bruma relative ${destacado ? "h-72 sm:h-96" : "h-44"}`}>
          <div className={`h-full w-full bg-gradient-to-br ${articulo.portada}`} />
          <span className="absolute left-4 top-4 z-[1] bg-vidrio/90 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-pizarra">
            {categoria?.nombre}
          </span>
          {articulo.premium && (
            <span className="etiqueta absolute bottom-4 right-4 z-[1] bg-vidrio/90 text-acero">
              Suscriptores
            </span>
          )}
        </div>

        <div className={`flex flex-1 flex-col gap-3 ${destacado ? "p-7 sm:p-9" : "p-6"}`}>
          <h3
            className={`titular-apretado font-titular font-semibold text-pizarra ${
              destacado ? "text-3xl sm:text-4xl" : "text-xl"
            }`}
          >
            <span className="subrayado group-hover:subrayado-activo">{articulo.titulo}</span>
          </h3>

          <p className={`leading-relaxed text-acero ${destacado ? "text-base" : "text-sm"}`}>
            {articulo.bajada}
          </p>

          <p className="mt-auto pt-4 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-acero">
            {formatearFecha(articulo.fecha)} · {articulo.minutosLectura} min
          </p>
        </div>
      </Link>
    </article>
  );
}
