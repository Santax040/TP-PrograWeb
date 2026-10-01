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
      className="tarjeta flex flex-col gap-6 p-7"
    >
      <label className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-acero">Nombre</span>
        <input
          required
          name="nombre"
          maxLength={60}
          autoComplete="nickname"
          defaultValue={estado.nombre ?? nombreActual}
          className="border border-hormigon bg-niebla px-3 py-2.5 text-pizarra outline-none transition-colors focus:border-agua"
        />
        <span className="text-xs text-acero">
          Es el que aparece en el header. Hasta 60 caracteres.
        </span>
      </label>

      {estado.error && (
        <p role="alert" className="border-l-2 border-agua bg-niebla px-3 py-2 text-sm text-pizarra">
          {estado.error}
        </p>
      )}
      {estado.ok && (
        <p role="status" className="border-l-2 border-musgo bg-niebla px-3 py-2 text-sm text-pizarra">
          {estado.ok}
        </p>
      )}

      <button
        type="submit"
        disabled={pendiente}
        className="self-start bg-pizarra px-6 py-2.5 font-titular text-sm uppercase tracking-[0.1em] text-niebla transition-colors hover:bg-agua disabled:opacity-60"
      >
        {pendiente ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
