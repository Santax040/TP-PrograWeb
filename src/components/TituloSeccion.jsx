import Link from "next/link";

/**
 * Encabezado de sección: el título en la letra techno y una línea del HUD
 * que sale de él y cruza hasta el enlace.
 *
 * @param {Object} props
 * @param {string} props.titulo
 * @param {string} [props.href]
 * @param {string} [props.enlace]
 */
export default function TituloSeccion({ titulo, href, enlace }) {
  return (
    <div className="mb-10 flex items-center gap-5">
      <h2 className="shrink-0 font-ancha text-xl uppercase text-white [text-shadow:0_0_16px_#ffffffb3] sm:text-3xl">
        {titulo}
      </h2>
      <span aria-hidden="true" className="linea-brillo min-w-6 flex-1" />
      {href && enlace && (
        <Link href={href} className="etiqueta shrink-0 text-marino hover:text-cobalto">
          {enlace}
        </Link>
      )}
    </div>
  );
}
