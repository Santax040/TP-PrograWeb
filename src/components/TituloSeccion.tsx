import Link from "next/link";

type Props = {
  titulo: string;
  /** Enlace opcional a la derecha, escrito "a mano". */
  href?: string;
  enlace?: string;
};

/** Encabezado de sección: tira de papel pegada torcida y una flecha a mano. */
export default function TituloSeccion({ titulo, href, enlace }: Props) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <h2 className="papel inline-block -rotate-1 px-4 py-1 font-titular text-3xl uppercase tracking-tight shadow-[4px_4px_0_var(--sangre)] sm:text-4xl">
        {titulo}
      </h2>
      {href && enlace && (
        <Link
          href={href}
          className="rotate-2 font-marcador text-lg text-acido underline decoration-wavy underline-offset-4 hover:text-papel"
        >
          {enlace} →
        </Link>
      )}
    </div>
  );
}
