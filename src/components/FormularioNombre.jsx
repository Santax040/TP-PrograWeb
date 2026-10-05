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
        <span className="font-ancha text-[0.6rem] uppercase text-cobalto">Nombre</span>
        <input
          required
          name="nombre"
          maxLength={60}
          autoComplete="nickname"
          defaultValue={estado.nombre ?? nombreActual}
          className=" border border-white bg-white/70 px-3 py-2.5 text-marino outline-none transition-shadow focus:shadow-[0_0_0_1px_#1f45d6,0_0_16px_#7ff4ffb3]"
        />
        <span className="text-xs text-humo">
          Es el que aparece en el header. Hasta 60 caracteres.
        </span>
      </label>

      {estado.error && (
        <p role="alert" className=" border-l-2 border-cobalto bg-white/70 px-3 py-2 text-sm text-marino">
          {estado.error}
        </p>
      )}
      {estado.ok && (
        <p role="status" className=" border-l-2 border-lavanda bg-white/70 px-3 py-2 text-sm text-marino">
          {estado.ok}
        </p>
      )}

      <button
        type="submit"
        disabled={pendiente}
        className="cartel self-start px-7 py-2.5 font-titular text-sm transition-shadow hover:shadow-[0_0_24px_#7ff4ffb3] disabled:opacity-60"
      >
        {pendiente ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
