"use client";

import { useReproductor } from "@/components/Reproductor";
import { formatearDuracion } from "@/lib/formato";

/**
 * Cuánto va del tema que suena, y para saltar a otra parte. Es un `range`
 * nativo: se maneja con el mouse, el dedo y las flechas del teclado.
 *
 * @param {Object} props
 * @param {boolean} [props.conTiempos] - Mostrar "1:23 / 6:48" al lado.
 * @param {string} [props.className]
 */
export default function LineaDeTiempo({ conTiempos = false, className = "" }) {
  const { actual, tiempo, duracion, buscar } = useReproductor();
  if (!actual) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <input
        type="range"
        min={0}
        max={duracion || 0}
        step={1}
        value={Math.min(tiempo, duracion || 0)}
        onChange={(e) => buscar(Number(e.target.value))}
        aria-label={`Posición en ${actual.tema}`}
        aria-valuetext={`${formatearDuracion(tiempo)} de ${formatearDuracion(duracion)}`}
        className="h-1 min-w-0 flex-1 cursor-pointer accent-cobalto"
      />
      {conTiempos && (
        <span className="shrink-0 rotulo text-xs tabular-nums text-humo">
          {formatearDuracion(tiempo)} / {formatearDuracion(duracion)}
        </span>
      )}
    </div>
  );
}
