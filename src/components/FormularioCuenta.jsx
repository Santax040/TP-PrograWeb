"use client";

import { startTransition, useActionState } from "react";
import { crearCuenta, entrarConMail } from "@/app/auth/acciones";
import { LARGO_MINIMO_CLAVE } from "@/lib/cuenta";

/**
 * Entrar o crear cuenta con mail y contraseña, según `modo`.
 *
 * Se manda a mano (`onSubmit`) y no con `<form action>`: con `action`, React
 * vacía el formulario después de cada envío y, ante un error, se perdería lo
 * escrito. Así, si algo falla, todo queda como estaba.
 *
 * @param {Object} props
 * @param {"entrar" | "crear"} props.modo
 * @param {string} [props.siguiente] - A dónde volver después de entrar.
 */
export default function FormularioCuenta({ modo, siguiente = "/" }) {
  const crear = modo === "crear";
  const [estado, accion, pendiente] = useActionState(crear ? crearCuenta : entrarConMail, {});

  function enviar(evento) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    startTransition(() => accion(datos));
  }

  return (
    <form onSubmit={enviar} className="tarjeta flex flex-col gap-5 p-7">
      <input type="hidden" name="siguiente" value={siguiente} />

      {crear && (
        <Campo etiqueta="Nombre" name="nombre" autoComplete="name" maxLength={60} ayuda="El que se ve en la revista." />
      )}
      <Campo etiqueta="Mail" name="email" type="email" autoComplete="email" />
      <Campo
        etiqueta="Contraseña"
        name="password"
        type="password"
        autoComplete={crear ? "new-password" : "current-password"}
        minLength={crear ? LARGO_MINIMO_CLAVE : undefined}
        ayuda={crear ? `Al menos ${LARGO_MINIMO_CLAVE} caracteres.` : undefined}
      />

      {estado.error && (
        <p role="alert" className="border-l-2 border-cobalto bg-white/70 px-3 py-2 text-sm text-marino">
          {estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pendiente}
        className="cartel self-start px-7 py-2.5 font-titular text-sm transition-shadow hover:shadow-[0_0_24px_#7ff4ffb3] disabled:opacity-60"
      >
        {pendiente ? "Un momento…" : crear ? "Crear cuenta" : "Entrar"}
      </button>
    </form>
  );
}

function Campo({ etiqueta, ayuda, ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="rotulo text-sm text-cobalto">{etiqueta}</span>
      <input
        required
        {...props}
        className="w-full border border-white bg-white/70 px-3 py-2.5 text-marino outline-none transition-shadow focus:shadow-[0_0_0_1px_#1f45d6,0_0_16px_#7ff4ffb3]"
      />
      {ayuda && <span className="text-xs text-humo">{ayuda}</span>}
    </label>
  );
}
