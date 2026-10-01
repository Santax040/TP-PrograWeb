import Link from "next/link";

/**
 * Encabezado de sección: título alineado a la grilla, con una línea fina
 * que lo separa del contenido, como la cabecera de un panel de información.
 *
 * @param {Object} props
 * @param {string} props.titulo
 * @param {string} [props.href] - Destino del enlace opcional de la derecha.
 * @param {string} [props.enlace] - Texto de ese enlace.
 */
export default function TituloSeccion({ titulo, href, enlace }) {
  return (
    <div className="mb-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-hormigon pb-4">
      <h2 className="titular-apretado font-titular text-2xl font-semibold uppercase tracking-[0.08em] text-pizarra sm:text-3xl">
        {titulo}
      </h2>
      {href && enlace && (
        <Link
          href={href}
          className="font-mono text-xs uppercase tracking-[0.18em] text-acero transition-colors hover:text-agua"
        >
          {enlace} →
        </Link>
      )}
    </div>
  );
}
