"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LineaDeTiempo from "@/components/LineaDeTiempo";
import { useReproductor } from "@/components/Reproductor";

/**
 * Barra fija abajo con lo que suena, para cuando la persona sale de la
 * portada: la música sigue y desde acá se pausa o se pasa de tema. En la
 * portada no aparece, porque ahí manda el tocadiscos.
 *
 * Deja un espacio del mismo alto al final de la página, así no tapa el footer.
 */
export default function BarraReproductor() {
  const { actual, sonando, cargando, haySiguiente, alternar, siguiente } = useReproductor();
  const ruta = usePathname();

  if (!actual || ruta === "/") return null;

  return (
    <>
      <div aria-hidden="true" className="h-24" />
      <section
        aria-label="Reproductor"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white bg-escarcha/85 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3">
          <LineaDeTiempo />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={alternar}
              aria-label={sonando ? "Pausar" : "Seguir escuchando"}
              className="cartel flex size-9 shrink-0 items-center justify-center hover:bg-marino"
            >
              {sonando ? <IconoPausa /> : <IconoPlay />}
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium leading-tight text-marino">
                {actual.tema}
                {cargando && <span className="ml-2 rotulo text-xs text-humo">cargando…</span>}
              </p>
              <Link
                href={`/artistas/${actual.artistaSlug}`}
                className="block truncate rotulo text-xs uppercase text-humo hover:text-cobalto"
              >
                {actual.artista}
              </Link>
            </div>

            <button
              type="button"
              onClick={siguiente}
              disabled={!haySiguiente}
              aria-label="Siguiente tema"
              className="flex size-9 shrink-0 items-center justify-center border border-white bg-white/60 text-marino hover:bg-white disabled:opacity-40"
            >
              <IconoSiguiente />
            </button>

            <Link href="/" className="hidden shrink-0 rotulo text-xs uppercase text-cobalto hover:text-marino sm:block">
              Ver el disco
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function IconoPlay() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 fill-current">
      <path d="M4 2.5v11l9-5.5z" />
    </svg>
  );
}

function IconoPausa() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 fill-current">
      <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" />
    </svg>
  );
}

function IconoSiguiente() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 fill-current">
      <path d="M3 2.5v11l7.5-5.5zM11 2.5h2v11h-2z" />
    </svg>
  );
}
