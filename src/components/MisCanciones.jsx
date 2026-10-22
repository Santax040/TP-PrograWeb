"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { borrarCancion, cambiarVisibilidad } from "@/app/estudio/acciones";
import ListaCanciones from "@/components/ListaCanciones";

/**
 * Los temas del artista en /estudio: escuchar, ocultar o mostrar, y borrar.
 * Los ocultos no aparecen en el sitio, pero su artista los puede escuchar acá.
 *
 * @param {Object} props
 * @param {Array<import("@/lib/musica").Cancion & { publicada: boolean }>} props.canciones
 */
export default function MisCanciones({ canciones }) {
  const router = useRouter();
  const [pendiente, empezar] = useTransition();
  const [aviso, setAviso] = useState(null);

  function hacer(accion) {
    empezar(async () => {
      const resultado = await accion();
      setAviso(resultado);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {canciones.length === 0 && <p className="text-humo">Todavía no subiste temas.</p>}
      <ListaCanciones
        canciones={canciones}
        extra={(cancion) => (
          <div className="flex shrink-0 items-center gap-3">
            {!cancion.publicada && <span className="etiqueta text-humo">Oculto</span>}
            <button
              type="button"
              disabled={pendiente}
              onClick={() => hacer(() => cambiarVisibilidad(cancion.id, !cancion.publicada))}
              className="text-sm text-humo underline underline-offset-4 hover:text-marino disabled:opacity-60"
            >
              {cancion.publicada ? "Ocultar" : "Mostrar"}
            </button>
            <button
              type="button"
              disabled={pendiente}
              onClick={() => {
                if (window.confirm(`¿Borrar "${cancion.tema}"? No se puede deshacer.`)) {
                  hacer(() => borrarCancion(cancion.id));
                }
              }}
              className="text-sm text-humo underline underline-offset-4 hover:text-marino disabled:opacity-60"
            >
              Borrar
            </button>
          </div>
        )}
      />
      {aviso && (
        <p
          role={aviso.error ? "alert" : "status"}
          className={`border-l-2 bg-white/70 px-3 py-2 text-sm text-marino ${aviso.error ? "border-cobalto" : "border-lavanda"}`}
        >
          {aviso.error ?? aviso.ok}
        </p>
      )}
    </div>
  );
}
