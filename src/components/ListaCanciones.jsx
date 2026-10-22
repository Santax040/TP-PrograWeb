"use client";

import { useReproductor } from "@/components/Reproductor";

/**
 * Temas con su botón para escuchar. Tocar uno pone la lista entera en el
 * reproductor del sitio, así sigue con el próximo al terminar.
 *
 * @param {Object} props
 * @param {import("@/lib/musica").Cancion[]} props.canciones
 * @param {(cancion: import("@/lib/musica").Cancion) => import("react").ReactNode} [props.extra]
 *   Lo que va al final de cada renglón (los botones de /estudio). Solo desde
 *   componentes de cliente: una función no se puede pasar desde el servidor.
 */
export default function ListaCanciones({ canciones, extra }) {
  const { actual, sonando, tocar, pausar } = useReproductor();
  if (canciones.length === 0) return null;

  return (
    <ol className="border-t border-white/70">
      {canciones.map((cancion, i) => {
        const esta = actual?.id === cancion.id;
        const suena = esta && sonando;
        return (
          <li key={cancion.id} className={`flex items-center gap-3 border-b border-white/70 px-2 py-3 ${esta ? "bg-white/60" : ""}`}>
            <button
              type="button"
              onClick={() => (suena ? pausar() : tocar(canciones, i))}
              aria-label={suena ? `Pausar ${cancion.tema}` : `Escuchar ${cancion.tema}`}
              className="cartel flex size-9 shrink-0 items-center justify-center hover:bg-marino"
            >
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 fill-current">
                <path d={suena ? "M4 2.5h3v11H4zM9 2.5h3v11H9z" : "M4 2.5v11l9-5.5z"} />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium leading-snug text-marino">{cancion.tema}</p>
              <p className="mt-0.5 flex gap-3 rotulo text-xs uppercase text-humo">
                <span>{cancion.duracion}</span>
                <span className="truncate">{cancion.genero}</span>
              </p>
            </div>
            {extra?.(cancion)}
          </li>
        );
      })}
    </ol>
  );
}
