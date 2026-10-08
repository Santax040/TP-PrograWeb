"use client";

import { useState } from "react";
import ArticuloCard from "@/components/ArticuloCard";
import { BarraFiltros, Selector, opcionesDe } from "@/components/Filtros";

const ORDENES = [
  { valor: "nuevas", texto: "Nuevas primero" },
  { valor: "viejas", texto: "Viejas primero" },
];

/**
 * Archivo de notas con filtros: orden por fecha, autor y artista.
 *
 * Filtra en el navegador: son pocas notas, ya vienen todas en la página, y
 * así la página sigue siendo estática. No hay filtro por sección porque hoy
 * hay una sola (Música); si vuelven a ser varias, se agrega acá.
 *
 * @param {Object} props
 * @param {Array<import("@/lib/data").Articulo & { nombresArtistas: string[] }>} props.notas
 *   De la más nueva a la más vieja, con los nombres de los artistas ya resueltos.
 */
export default function NotasFiltrables({ notas }) {
  const [orden, setOrden] = useState("nuevas");
  const [autor, setAutor] = useState("");
  const [artista, setArtista] = useState("");

  const visibles = notas.filter(
    (n) => (!autor || n.autor === autor) && (!artista || n.nombresArtistas.includes(artista)),
  );
  if (orden === "viejas") visibles.reverse();

  const hayFiltros = orden !== "nuevas" || autor !== "" || artista !== "";
  function limpiar() {
    setOrden("nuevas");
    setAutor("");
    setArtista("");
  }

  return (
    <>
      <BarraFiltros
        mostrados={visibles.length}
        total={notas.length}
        nombre="notas"
        hayFiltros={hayFiltros}
        alLimpiar={limpiar}
      >
        <Selector etiqueta="Ordenar" valor={orden} alCambiar={setOrden} opciones={ORDENES} />
        <Selector
          etiqueta="Autor"
          valor={autor}
          alCambiar={setAutor}
          opciones={opcionesDe(notas.map((n) => n.autor))}
        />
        <Selector
          etiqueta="Artista"
          valor={artista}
          alCambiar={setArtista}
          opciones={opcionesDe(notas.flatMap((n) => n.nombresArtistas))}
        />
      </BarraFiltros>

      {visibles.length === 0 ? (
        <div className="tarjeta max-w-md p-8">
          <p className="leading-relaxed text-humo">Ninguna nota coincide con estos filtros.</p>
          <button type="button" onClick={limpiar} className="etiqueta mt-4 text-cobalto hover:text-marino">
            Ver todas las notas
          </button>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((a) => (
            <ArticuloCard key={a.slug} articulo={a} />
          ))}
        </div>
      )}
    </>
  );
}
