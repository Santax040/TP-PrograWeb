"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { borrarCancion, cambiarPrecio, cambiarVisibilidad } from "@/app/estudio/acciones";
import CampoPrecio from "@/components/CampoPrecio";
import ListaCanciones from "@/components/ListaCanciones";
import { etiquetaDePrecio, modoDePrecio } from "@/lib/estudio";
import { formatearPrecio } from "@/lib/formato";

const BOTON_TEXTO = "text-sm text-humo underline underline-offset-4 hover:text-marino disabled:opacity-60";

/**
 * Los temas del artista en /estudio: escuchar, poner precio, ocultar o
 * mostrar, y borrar. Los ocultos no aparecen en el sitio, pero su artista los
 * puede escuchar acá.
 *
 * @param {Object} props
 * @param {Array<import("@/lib/musica").Cancion & { publicada: boolean, precio: number|null, pagaLoQueQuieras: boolean, ventas: number, recaudado: number }>} props.canciones
 * @param {boolean} props.conPrecio - Aceptó la declaración de derechos: puede ponerles precio.
 * @param {boolean} props.puedeCobrar - Conectó Mercado Pago.
 */
export default function MisCanciones({ canciones, conPrecio, puedeCobrar }) {
  const router = useRouter();
  const [pendiente, empezar] = useTransition();
  const [aviso, setAviso] = useState(null);
  const [editando, setEditando] = useState(null); // { id, modo, monto }

  function hacer(accion, alSalirBien) {
    empezar(async () => {
      const resultado = await accion();
      setAviso(resultado);
      if (!resultado.error) alSalirBien?.();
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
              className={BOTON_TEXTO}
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
              className={BOTON_TEXTO}
            >
              Borrar
            </button>
          </div>
        )}
        debajo={(cancion) => (
          <div className="flex flex-col gap-3 pl-12">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-humo">
              <span className="rotulo text-xs uppercase text-marino">
                {etiquetaDePrecio(cancion.precio, cancion.pagaLoQueQuieras)}
              </span>
              {cancion.ventas > 0 && (
                <span>
                  {cancion.ventas} {cancion.ventas === 1 ? "venta" : "ventas"} · {formatearPrecio(cancion.recaudado)}
                </span>
              )}
              {(cancion.precio > 0 || cancion.pagaLoQueQuieras) && !puedeCobrar && (
                <span>Falta conectar Mercado Pago para cobrarlo.</span>
              )}
              {conPrecio && editando?.id !== cancion.id && (
                <button
                  type="button"
                  disabled={pendiente}
                  onClick={() => {
                    setAviso(null);
                    setEditando({ id: cancion.id, ...modoDePrecio(cancion.precio, cancion.pagaLoQueQuieras) });
                  }}
                  className={BOTON_TEXTO}
                >
                  Cambiar precio
                </button>
              )}
            </p>

            {editando?.id === cancion.id && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  hacer(() => cambiarPrecio(cancion.id, editando.modo, editando.monto), () => setEditando(null));
                }}
                className="flex flex-col gap-4 bg-white/40 p-4"
              >
                <CampoPrecio
                  modo={editando.modo}
                  monto={editando.monto}
                  alCambiar={(precio) => setEditando({ id: cancion.id, ...precio })}
                  deshabilitado={pendiente}
                />
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={pendiente}
                    className="cartel px-5 py-2 font-titular text-sm transition-shadow hover:shadow-[0_0_24px_#7ff4ffb3] disabled:opacity-60"
                  >
                    Guardar precio
                  </button>
                  <button type="button" disabled={pendiente} onClick={() => setEditando(null)} className={BOTON_TEXTO}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}
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
