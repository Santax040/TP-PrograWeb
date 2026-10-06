"use client";

import { startTransition, useActionState, useState } from "react";
import Link from "next/link";
import { borrarNota, guardarNota } from "@/app/redaccion/acciones";
import CampoArtistas from "@/components/CampoArtistas";
import { largos, portadas } from "@/lib/redaccion";
import { categorias } from "@/lib/site";

/**
 * Editor de notas de Redacción.
 *
 * Izquierda, lo que se lee: título, bajada y texto. Derecha, los datos de
 * publicación: estado, sección, fecha, firma, portada y artistas.
 *
 * Dos botones mandan el mismo formulario con distinto `estado` (borrador o
 * publicada). Se manda a mano (`onSubmit`) por lo mismo que en
 * FormularioPropuesta: con `<form action>`, React vacía los campos después
 * de guardar, y acá se tienen que quedar como están.
 *
 * @param {Object} props
 * @param {Object} props.nota - Valores iniciales (vacíos si es nueva). `artistas` son nombres.
 * @param {{ slug: string, nombre: string }[]} props.artistas - Los que tienen ficha, para sugerir.
 * @param {boolean} props.esAdmin
 * @param {string} [props.aviso] - Mensaje al llegar (por ejemplo, recién creada).
 */
export default function EditorNota({ nota, artistas, esAdmin, aviso }) {
  const [estado, accion, pendiente] = useActionState(guardarNota, {});
  const [portada, setPortada] = useState(nota.portada ?? portadas[0].clases);
  const estadoActual = estado.estado ?? nota.estado ?? "borrador";
  const publicada = estadoActual === "publicada";
  const slug = estado.slug ?? nota.slug;

  function enviar(evento) {
    evento.preventDefault();
    // El botón que se apretó viaja en el formulario con su `estado`.
    const datos = new FormData(evento.currentTarget, evento.nativeEvent.submitter);
    startTransition(() => accion(datos));
  }

  const mensaje = estado.error ?? estado.ok ?? aviso;

  return (
    <form onSubmit={enviar} className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      {nota.id && <input type="hidden" name="id" value={nota.id} />}

      {/* --- Lo que se lee ------------------------------------------------ */}
      <div className="tarjeta flex min-w-0 flex-col gap-7 p-6 sm:p-9">
        <label className="flex flex-col gap-2">
          <span className="rotulo text-sm text-cobalto">Título</span>
          <textarea
            name="titulo"
            required
            rows={2}
            maxLength={largos.titulo}
            defaultValue={nota.titulo}
            placeholder="Crónica de una fiesta que no terminó"
            className={`${claseEntrada} titular-apretado resize-none font-titular text-3xl font-light sm:text-4xl`}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="rotulo text-sm text-cobalto">Bajada</span>
          <textarea
            name="bajada"
            rows={3}
            maxLength={largos.bajada}
            defaultValue={nota.bajada}
            placeholder="Una o dos oraciones que cuenten de qué va."
            className={`${claseEntrada} resize-y text-lg leading-relaxed`}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="rotulo text-sm text-cobalto">Texto</span>
          <textarea
            name="cuerpo"
            rows={18}
            maxLength={largos.cuerpo}
            defaultValue={nota.cuerpo}
            className={`${claseEntrada} resize-y text-lg leading-[1.75]`}
          />
          <span className="text-xs text-humo">
            Dejá un renglón en blanco entre párrafos. El primero lleva la letra capital.
          </span>
        </label>
      </div>

      {/* --- Datos de publicación ---------------------------------------- */}
      <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
        <div className="tarjeta flex flex-col gap-4 p-6">
          <p className="flex items-center justify-between gap-3">
            <span className="rotulo text-sm text-marino">Estado</span>
            <span className={`etiqueta ${publicada ? "text-cobalto" : "text-humo"}`}>
              {publicada ? "Publicada" : "Borrador"}
            </span>
          </p>

          {mensaje && (
            <p
              role={estado.error ? "alert" : "status"}
              className={`border-l-2 bg-white/70 px-3 py-2 text-sm text-marino ${
                estado.error ? "border-cobalto" : "border-lavanda"
              }`}
            >
              {mensaje}
            </p>
          )}

          <button
            type="submit"
            name="estado"
            value="publicada"
            disabled={pendiente}
            className="cartel px-5 py-2.5 font-titular text-sm transition-shadow hover:shadow-[0_0_24px_#7ff4ffb3] disabled:opacity-60"
          >
            {pendiente ? "Guardando…" : publicada ? "Guardar cambios" : "Publicar"}
          </button>
          <button
            type="submit"
            name="estado"
            value="borrador"
            disabled={pendiente}
            className="border border-white bg-white/60 px-5 py-2.5 font-titular text-sm text-marino transition-colors hover:bg-white disabled:opacity-60"
          >
            {publicada ? "Pasar a borrador" : "Guardar borrador"}
          </button>

          {publicada && slug && (
            <Link
              href={`/notas/${slug}`}
              target="_blank"
              className="text-center text-sm text-cobalto underline underline-offset-4"
            >
              Ver la nota publicada
            </Link>
          )}
        </div>

        <div className="tarjeta flex flex-col gap-5 p-6">
          {/* Con una sola sección, un desplegable de una opción no tiene
              sentido: se muestra fija. Si vuelven a ser varias, aparece. */}
          {categorias.length === 1 ? (
            <p className="flex items-center justify-between gap-3">
              <span className="rotulo text-sm text-cobalto">Sección</span>
              <span className="text-marino">{categorias[0].nombre}</span>
              <input type="hidden" name="categoria" value={categorias[0].slug} />
            </p>
          ) : (
            <label className="flex flex-col gap-1.5">
              <span className="rotulo text-sm text-cobalto">Sección</span>
              <select name="categoria" required defaultValue={nota.categoria ?? ""} className={claseEntrada}>
                <option value="" disabled>
                  Elegí una
                </option>
                {categorias.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="rotulo text-sm text-cobalto">Fecha</span>
            <input type="date" name="fecha" required defaultValue={nota.fecha} className={claseEntrada} />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="rotulo text-sm text-cobalto">Firma</span>
            <input
              name="firma"
              maxLength={largos.firma}
              defaultValue={nota.firma}
              className={claseEntrada}
            />
            <span className="text-xs text-humo">El nombre que aparece como autor.</span>
          </label>

          <label className="flex items-start gap-3 text-sm text-marino">
            <input type="checkbox" name="premium" defaultChecked={nota.premium} className="mt-1 accent-cobalto" />
            <span>
              Exclusiva para suscriptores
              <span className="block text-xs text-humo">Por ahora se lee igual: no hay pagos.</span>
            </span>
          </label>

          {esAdmin && (
            <label className="flex items-start gap-3 text-sm text-marino">
              <input
                type="checkbox"
                name="destacado"
                defaultChecked={nota.destacado}
                className="mt-1 accent-cobalto"
              />
              <span>
                Destacar en la portada
                <span className="block text-xs text-humo">Solo los admins pueden destacar.</span>
              </span>
            </label>
          )}
        </div>

        <fieldset className="tarjeta p-6">
          <legend className="sr-only">Portada</legend>
          <p className="rotulo mb-3 text-sm text-cobalto" aria-hidden="true">
            Portada
          </p>
          <div className="grid grid-cols-3 gap-2">
            {portadas.map((p) => (
              <label
                key={p.clases}
                title={p.nombre}
                className={`bruma relative block h-14 cursor-pointer border-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-cobalto ${
                  portada === p.clases ? "border-cobalto" : "border-transparent"
                }`}
              >
                <span className={`block h-full w-full bg-gradient-to-br ${p.clases}`} />
                <input
                  type="radio"
                  name="portada"
                  value={p.clases}
                  checked={portada === p.clases}
                  onChange={() => setPortada(p.clases)}
                  className="sr-only"
                />
                <span className="sr-only">{p.nombre}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="tarjeta p-6">
          <CampoArtistas iniciales={nota.artistas ?? []} sugerencias={artistas.map((a) => a.nombre)} />
        </div>

        {nota.id && <BorrarNota id={nota.id} />}
      </aside>
    </form>
  );
}

const claseEntrada =
  "w-full border border-white bg-white/70 px-3 py-2.5 text-marino outline-none transition-shadow placeholder:text-humo/60 focus:shadow-[0_0_0_1px_#1f45d6,0_0_16px_#7ff4ffb3]";

/**
 * Borrar pide confirmación con un segundo clic. Llama a su Server Action
 * directo, sin enviar el formulario: si fuera un botón `submit`, lo atraparía
 * el `onSubmit` del editor y se guardaría en vez de borrarse.
 */
function BorrarNota({ id }) {
  const [seguro, setSeguro] = useState(false);
  const [borrando, setBorrando] = useState(false);

  function borrar() {
    setBorrando(true);
    const datos = new FormData();
    datos.set("id", String(id));
    startTransition(() => borrarNota(datos));
  }

  if (!seguro) {
    return (
      <button
        type="button"
        onClick={() => setSeguro(true)}
        className="self-start text-sm text-humo underline underline-offset-4 hover:text-marino"
      >
        Borrar esta nota
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-l-2 border-cobalto bg-white/70 px-4 py-3 text-sm text-marino">
      <p>Se borra para siempre, también de la revista. ¿Seguro?</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={borrar}
          disabled={borrando}
          className="cartel px-4 py-1.5 font-titular text-sm disabled:opacity-60"
        >
          {borrando ? "Borrando…" : "Sí, borrar"}
        </button>
        <button type="button" onClick={() => setSeguro(false)} className="underline underline-offset-4">
          Cancelar
        </button>
      </div>
    </div>
  );
}
