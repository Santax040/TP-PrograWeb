"use client";

import { useActionState } from "react";
import { cambiarNombre } from "@/app/configuracion/acciones";

/**
 * Formulario para cambiar el nombre que se muestra en el header.
 *
 * `useActionState` guarda lo que devuelve la Server Action (un error, un
 * aviso de éxito y el valor ya escrito) y avisa mientras espera la
 * respuesta, para deshabilitar el botón.
 */
export default function FormularioNombre({ nombreActual }) {
  const [estado, accion, pendiente] = useActionState(cambiarNombre, {});

  return (
    <form
      action={accion}
      className="papel roto flex flex-col gap-5 p-6 pb-10 shadow-[6px_6px_0_rgba(0,0,0,0.6)]"
    >
      <label className="flex flex-col gap-1">
        <span className="font-titular text-sm uppercase tracking-wide">Nombre</span>
        <input
          required
          name="nombre"
          maxLength={60}
          autoComplete="nickname"
          defaultValue={estado.nombre ?? nombreActual}
          className="border-2 border-tinta bg-papel px-3 py-2 text-tinta outline-none focus:border-sangre focus:shadow-[3px_3px_0_var(--acido)]"
        />
        <span className="text-xs text-tinta/70">
          Es el que aparece en el header. Hasta 60 caracteres.
        </span>
      </label>

      {estado.error && (
        <p role="alert" className="-rotate-1 border-2 border-sangre px-3 py-2 font-bold text-sangre">
          {estado.error}
        </p>
      )}
      {estado.ok && (
        <p role="status" className="-rotate-1 border-2 border-tinta px-3 py-2 font-bold text-tinta">
          {estado.ok}
        </p>
      )}

      <button
        type="submit"
        disabled={pendiente}
        className="self-start -rotate-1 bg-sangre px-5 py-2 font-titular text-lg uppercase tracking-wide text-papel shadow-[4px_4px_0_var(--tinta)] transition-transform hover:rotate-0 disabled:opacity-60"
      >
        {pendiente ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
