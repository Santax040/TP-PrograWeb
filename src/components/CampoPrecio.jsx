"use client";

import { MODOS_DE_PRECIO, PRECIO_MAXIMO } from "@/lib/estudio";

const CAMPO =
  "border border-white bg-white/70 px-3 py-2.5 text-marino outline-none transition-shadow focus:shadow-[0_0_0_1px_#1f45d6,0_0_16px_#7ff4ffb3]";

/**
 * Cómo se ofrece un tema: no se vende, gratis, precio fijo o "pagá lo que
 * quieras". La validación es `leerPrecio` (src/lib/estudio.js).
 *
 * @param {Object} props
 * @param {string} props.modo
 * @param {string} props.monto
 * @param {(precio: { modo: string, monto: string }) => void} props.alCambiar
 * @param {boolean} [props.deshabilitado]
 */
export default function CampoPrecio({ modo, monto, alCambiar, deshabilitado = false }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 rotulo text-xs uppercase text-cobalto">Venta</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {MODOS_DE_PRECIO.map((m) => (
          <label key={m.valor} className="flex cursor-pointer items-center gap-2 text-sm text-marino">
            <input
              type="radio"
              value={m.valor}
              checked={modo === m.valor}
              disabled={deshabilitado}
              onChange={() => alCambiar({ modo: m.valor, monto })}
              className="accent-cobalto"
            />
            {m.nombre}
          </label>
        ))}
      </div>

      {(modo === "fijo" || modo === "libre") && (
        <label className="flex flex-col gap-1">
          <span className="rotulo text-xs uppercase text-cobalto">
            {modo === "fijo" ? "Precio en pesos" : "Mínimo en pesos"}
          </span>
          <input
            required
            type="number"
            inputMode="numeric"
            min={0}
            max={PRECIO_MAXIMO}
            step={1}
            value={monto}
            disabled={deshabilitado}
            onChange={(e) => alCambiar({ modo, monto: e.target.value })}
            className={CAMPO}
          />
          <span className="text-xs text-humo">
            {modo === "fijo"
              ? "Desde $100. Cobrás todo: la revista no se queda con nada."
              : "0 para que también se pueda bajar gratis, o desde $100. Cobrás todo: la revista no se queda con nada."}
          </span>
        </label>
      )}
    </fieldset>
  );
}
