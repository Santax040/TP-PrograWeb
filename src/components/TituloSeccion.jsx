import Link from "next/link";

/**
 * Encabezado de sección: título en minúscula fina, con una línea de vidrio
 * que lo separa del contenido y un enlace en píldora a la derecha.
 *
 * @param {Object} props
 * @param {string} props.titulo
 * @param {string} [props.href] - Destino del enlace opcional de la derecha.
 * @param {string} [props.enlace] - Texto de ese enlace.
 */
export default function TituloSeccion({ titulo, href, enlace }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-white/70 pb-4">
      <h2 className="titular-apretado font-titular text-3xl font-extralight lowercase text-marino sm:text-4xl">
        {titulo}
      </h2>
      {href && enlace && (
        <Link
          href={href}
          className="etiqueta text-cobalto transition-colors hover:bg-cobalto hover:text-white"
        >
          {enlace} →
        </Link>
      )}
    </div>
  );
}
