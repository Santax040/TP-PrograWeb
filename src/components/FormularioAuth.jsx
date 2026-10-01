"use client";

import { useActionState } from "react";
import Link from "next/link";
import { iniciarSesion, registrarse } from "@/app/auth/acciones";

/**
 * Formulario de login o de registro, según `modo`.
 *
 * `useActionState` conecta el formulario con la Server Action: guarda lo que
 * devuelve (un error, un aviso o los campos ya escritos) y avisa mientras
 * espera la respuesta (`pendiente`), para deshabilitar el botón.
 */
export default function FormularioAuth({ modo, siguiente = "/" }) {
  const esRegistro = modo === "registro";
  const [estado, accion, pendiente] = useActionState(
    esRegistro ? registrarse : iniciarSesion,
    {},
  );

  // Registro exitoso con confirmación por mail: no hay nada más que completar.
  if (estado.ok) {
    return (
      <div className="papel roto border-l-8 border-acido p-6 pb-9 shadow-[6px_6px_0_rgba(0,0,0,0.6)]">
        <p className="font-titular text-2xl uppercase">Revisá tu mail</p>
        <p className="mt-2 leading-snug">{estado.ok}</p>
        <p className="mt-4 text-sm text-tinta/75">
          ¿Ya lo confirmaste?{" "}
          <Link href="/login" className="underline decoration-sangre decoration-2">
            Entrá acá
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      action={accion}
      className="papel roto flex flex-col gap-5 p-6 pb-10 shadow-[6px_6px_0_rgba(0,0,0,0.6)]"
    >
      <input type="hidden" name="siguiente" value={siguiente} />

      {esRegistro && (
        <Campo
          etiqueta="Nombre"
          name="nombre"
          autoComplete="nickname"
          maxLength={60}
          defaultValue={estado.nombre}
        />
      )}
      <Campo
        etiqueta="Mail"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={estado.email}
      />
      <Campo
        etiqueta="Contraseña"
        name="password"
        type="password"
        autoComplete={esRegistro ? "new-password" : "current-password"}
        minLength={esRegistro ? 8 : undefined}
        ayuda={esRegistro ? "Al menos 8 caracteres." : undefined}
      />

      {estado.error && (
        <p role="alert" className="-rotate-1 border-2 border-sangre px-3 py-2 font-bold text-sangre">
          {estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pendiente}
        className="self-start -rotate-1 bg-sangre px-5 py-2 font-titular text-lg uppercase tracking-wide text-papel shadow-[4px_4px_0_var(--tinta)] transition-transform hover:rotate-0 disabled:opacity-60"
      >
        {pendiente ? "Un momento…" : esRegistro ? "Crear cuenta" : "Entrar"}
      </button>
    </form>
  );
}

function Campo({ etiqueta, ayuda, ...props }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-titular text-sm uppercase tracking-wide">{etiqueta}</span>
      <input
        required
        {...props}
        className="border-2 border-tinta bg-papel px-3 py-2 text-tinta outline-none focus:border-sangre focus:shadow-[3px_3px_0_var(--acido)]"
      />
      {ayuda && <span className="text-xs text-tinta/70">{ayuda}</span>}
    </label>
  );
}
