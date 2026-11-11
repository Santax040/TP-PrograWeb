"use client";

import { useEffect, useState } from "react";

/**
 * Formulario que manda a pagar un tema a Mercado Pago.
 *
 * Armar el pago tarda un par de segundos y recién ahí el navegador cambia de
 * página. Para que el click se note en ese rato, el botón pasa a decir
 * "Yendo a pagar…" apenas se envía, y no deja mandar dos veces.
 *
 * Es un envío común del navegador (no `fetch`): el servidor responde con la
 * redirección a Mercado Pago.
 *
 * @param {Object} props
 * @param {string} props.cancionId
 * @param {string} props.claseBoton - Las clases del botón, las de `ListaConVenta`.
 * @param {string} [props.className] - Las del formulario.
 * @param {import("react").ReactNode} [props.children] - Campos extra (el monto
 *   de "pagá lo que quieras"), antes del botón.
 */
export default function BotonComprar({ cancionId, claseBoton, className = "shrink-0", children }) {
  const [yendo, setYendo] = useState(false);

  // Si se vuelve con "atrás", el navegador puede mostrar la página tal como
  // quedó, con el botón trabado: se lo destraba.
  useEffect(() => {
    const destrabar = () => setYendo(false);
    window.addEventListener("pageshow", destrabar);
    return () => window.removeEventListener("pageshow", destrabar);
  }, []);

  function alEnviar(evento) {
    if (yendo) return evento.preventDefault();
    setYendo(true);
  }

  return (
    <form action={`/api/canciones/${cancionId}/comprar`} method="post" onSubmit={alEnviar} className={className}>
      {children}
      {/* `aria-disabled` y no `disabled`: deshabilitarlo en pleno envío puede cancelarlo en algunos navegadores. */}
      <button type="submit" aria-disabled={yendo} aria-busy={yendo} className={`${claseBoton} ${yendo ? "cursor-wait opacity-60" : ""}`}>
        {yendo ? "Yendo a pagar…" : "Comprar"}
      </button>
    </form>
  );
}
