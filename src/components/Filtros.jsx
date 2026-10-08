/**
 * Piezas comunes de los filtros de Notas y Agenda: la barra y cada selector.
 *
 * Son `<select>` nativos a propósito: se usan con teclado y lector de
 * pantalla sin trabajo extra, y en celular abren la lista del sistema.
 */

/**
 * @param {Object} props
 * @param {string} props.etiqueta
 * @param {string} props.valor
 * @param {(valor: string) => void} props.alCambiar
 * @param {Array<{valor: string, texto: string}>} props.opciones
 */
export function Selector({ etiqueta, valor, alCambiar, opciones }) {
  return (
    <label className="flex min-w-0 basis-[calc(50%-0.5rem)] flex-col gap-1.5 sm:basis-auto sm:min-w-40">
      <span className="rotulo text-xs uppercase text-humo">{etiqueta}</span>
      <select
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value)}
        className="border border-white bg-white/60 py-2 pl-2 pr-1 text-sm text-marino sm:px-3 backdrop-blur-sm transition-colors hover:bg-white/80"
      >
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * La barra que agrupa los selectores, con el contador de resultados y el
 * botón para volver a mostrar todo.
 *
 * @param {Object} props
 * @param {number} props.mostrados
 * @param {number} props.total
 * @param {string} props.nombre - En plural: "notas", "fechas".
 * @param {boolean} props.hayFiltros - Si hay algún filtro distinto de "todos".
 * @param {() => void} props.alLimpiar
 * @param {import("react").ReactNode} props.children - Los selectores.
 */
export function BarraFiltros({ mostrados, total, nombre, hayFiltros, alLimpiar, children }) {
  return (
    <div className="tarjeta mb-12 flex flex-wrap items-end gap-4 p-4 hover:outline-transparent">
      {children}
      <div className="ml-auto flex items-center gap-4">
        <p className="rotulo text-xs uppercase text-humo" aria-live="polite">
          {mostrados === total ? `${total} ${nombre}` : `${mostrados} de ${total} ${nombre}`}
        </p>
        {hayFiltros && (
          <button
            type="button"
            onClick={alLimpiar}
            className="etiqueta text-cobalto hover:text-marino"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Convierte una lista de textos en opciones de selector, ordenadas y sin
 * repetir, con "Todos" adelante.
 *
 * @param {string[]} valores
 * @param {string} [todos]
 */
export function opcionesDe(valores, todos = "Todos") {
  const unicos = [...new Set(valores.filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  return [{ valor: "", texto: todos }, ...unicos.map((v) => ({ valor: v, texto: v }))];
}
