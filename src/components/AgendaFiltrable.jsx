"use client";

import { useState } from "react";
import EventoCard from "@/components/EventoCard";
import { BarraFiltros, Selector, opcionesDe } from "@/components/Filtros";

const ORDENES = [
  { valor: "proximas", texto: "Próximas primero" },
  { valor: "lejanas", texto: "Lejanas primero" },
];

/** "octubre de 2026" a partir de "2026-10-03". */
function mesDe(fecha) {
  return new Date(`${fecha}T00:00:00Z`).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Agenda con filtros: orden por fecha, género, artista del line-up y ciudad.
 * Los eventos se siguen agrupando por mes, en el orden elegido.
 *
 * Filtra en el navegador, como las notas: son pocas fechas y la página sigue
 * siendo estática.
 *
 * @param {Object} props
 * @param {Array<import("@/lib/data").Evento & { nombresLineup: string[] }>} props.eventos
 *   De la más próxima a la más lejana, con los nombres del line-up ya resueltos.
 */
export default function AgendaFiltrable({ eventos }) {
  const [orden, setOrden] = useState("proximas");
  const [genero, setGenero] = useState("");
  const [artista, setArtista] = useState("");
  const [ciudad, setCiudad] = useState("");

  const visibles = eventos.filter(
    (e) =>
      (!genero || e.genero === genero) &&
      (!artista || e.nombresLineup.includes(artista)) &&
      (!ciudad || e.ciudad === ciudad),
  );
  if (orden === "lejanas") visibles.reverse();

  // Agrupa por mes para que la lista se lea como una agenda de verdad.
  const porMes = new Map();
  for (const evento of visibles) {
    const mes = mesDe(evento.fecha);
    porMes.set(mes, [...(porMes.get(mes) ?? []), evento]);
  }

  const hayFiltros = orden !== "proximas" || genero !== "" || artista !== "" || ciudad !== "";
  function limpiar() {
    setOrden("proximas");
    setGenero("");
    setArtista("");
    setCiudad("");
  }

  return (
    <>
      <BarraFiltros
        mostrados={visibles.length}
        total={eventos.length}
        nombre="fechas"
        hayFiltros={hayFiltros}
        alLimpiar={limpiar}
      >
        <Selector etiqueta="Ordenar" valor={orden} alCambiar={setOrden} opciones={ORDENES} />
        <Selector
          etiqueta="Género"
          valor={genero}
          alCambiar={setGenero}
          opciones={opcionesDe(eventos.map((e) => e.genero))}
        />
        <Selector
          etiqueta="Artista"
          valor={artista}
          alCambiar={setArtista}
          opciones={opcionesDe(eventos.flatMap((e) => e.nombresLineup))}
        />
        <Selector
          etiqueta="Ciudad"
          valor={ciudad}
          alCambiar={setCiudad}
          opciones={opcionesDe(eventos.map((e) => e.ciudad), "Todas")}
        />
      </BarraFiltros>

      {visibles.length === 0 ? (
        <div className="tarjeta max-w-md p-8">
          <p className="leading-relaxed text-humo">Ninguna fecha coincide con estos filtros.</p>
          <button type="button" onClick={limpiar} className="etiqueta mt-4 text-cobalto hover:text-marino">
            Ver toda la agenda
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-16">
          {[...porMes.entries()].map(([mes, delMes]) => (
            <section key={mes}>
              <h2 className="mb-6 flex items-center gap-4 rotulo text-xs uppercase text-cobalto after:h-px after:flex-1 after:bg-white/80">
                {mes}
              </h2>
              <div className="flex flex-col gap-4">
                {delMes.map((e) => (
                  <EventoCard key={e.slug} evento={e} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
