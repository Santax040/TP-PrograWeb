"use client";

import { useId, useState } from "react";
import { normalizarNombre } from "@/lib/redaccion";

/**
 * Artistas de una nota, escritos a mano y opcionales.
 *
 * Se escribe un nombre y se agrega con Enter o coma; mientras se escribe,
 * el navegador sugiere los artistas que ya tienen ficha (`<datalist>`). Cada
 * nombre queda como etiqueta, con su ✕ para sacarlo; Borrar con el campo
 * vacío saca el último.
 *
 * Viajan en el formulario como varios `artistas`. La Server Action decide:
 * si el nombre coincide con un artista de la base, lo vincula a su ficha; si
 * no, lo guarda como texto.
 *
 * @param {Object} props
 * @param {string[]} props.iniciales - Nombres que ya tiene la nota.
 * @param {string[]} props.sugerencias - Nombres de los artistas con ficha.
 */
export default function CampoArtistas({ iniciales = [], sugerencias = [] }) {
  const [nombres, setNombres] = useState(iniciales);
  const [texto, setTexto] = useState("");
  const idLista = useId();
  const idCampo = useId();

  function agregar(valor) {
    const nombre = valor.replace(/,/g, "").trim().slice(0, 80);
    if (!nombre) return;
    // Sin repetidos, aunque cambien mayúsculas o tildes.
    const yaEsta = nombres.some((n) => normalizarNombre(n) === normalizarNombre(nombre));
    if (!yaEsta && nombres.length < 20) {
      // Si coincide con uno con ficha, se usa cómo está escrito en la ficha.
      const conFicha = sugerencias.find((s) => normalizarNombre(s) === normalizarNombre(nombre));
      setNombres([...nombres, conFicha ?? nombre]);
    }
    setTexto("");
  }

  function alTeclear(evento) {
    if (evento.key === "Enter" || evento.key === ",") {
      // Enter no tiene que mandar el formulario de la nota.
      evento.preventDefault();
      agregar(texto);
    } else if (evento.key === "Backspace" && !texto && nombres.length > 0) {
      setNombres(nombres.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={idCampo} className="rotulo text-sm text-cobalto">
        Artistas que aparecen <span className="font-normal text-humo">(opcional)</span>
      </label>

      {nombres.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {nombres.map((n) => (
            <li
              key={n}
              className="flex items-center gap-1 border border-white bg-white/80 py-1 pl-3 pr-1 text-sm text-marino"
            >
              {n}
              <input type="hidden" name="artistas" value={n} />
              <button
                type="button"
                onClick={() => setNombres(nombres.filter((x) => x !== n))}
                aria-label={`Sacar a ${n}`}
                className="px-1.5 text-humo hover:text-cobalto"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        id={idCampo}
        list={idLista}
        value={texto}
        onChange={(e) => {
          const valor = e.target.value;
          // Elegir una sugerencia o pegar "A, B" agrega sin apretar Enter.
          if (valor.includes(",")) {
            valor.split(",").slice(0, -1).forEach(agregar);
            setTexto(valor.split(",").at(-1));
          } else {
            setTexto(valor);
          }
        }}
        onKeyDown={alTeclear}
        onBlur={() => agregar(texto)}
        placeholder={nombres.length ? "Agregar otro" : "Escribí un nombre"}
        autoComplete="off"
        className="w-full border border-white bg-white/70 px-3 py-2.5 text-marino outline-none transition-shadow placeholder:text-humo/60 focus:shadow-[0_0_0_1px_#1f45d6,0_0_16px_#7ff4ffb3]"
      />
      <datalist id={idLista}>
        {sugerencias
          .filter((s) => !nombres.some((n) => normalizarNombre(n) === normalizarNombre(s)))
          .map((s) => (
            <option key={s} value={s} />
          ))}
      </datalist>
      <span className="text-xs leading-snug text-humo">
        Enter o coma para agregar. Si tiene ficha en la revista, la nota lo enlaza.
      </span>
    </div>
  );
}
