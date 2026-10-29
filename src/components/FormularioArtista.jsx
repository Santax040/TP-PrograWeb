"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { elegirArtista } from "@/app/configuracion/acciones";
import { DECLARACION_DERECHOS } from "@/lib/estudio";

/**
 * "Soy artista" en Configuración. Cambia la cuenta entre usuario y artista al
 * instante (lo decidió así el dueño de la revista: sin aprobación).
 *
 * La primera vez pide aceptar la declaración de derechos: los artistas pueden
 * vender su música. La base lo exige igual.
 *
 * El botón manda lo contrario de lo que la cuenta es ahora. La base solo deja
 * moverse entre esos dos roles.
 */
export default function FormularioArtista({ esArtista, yaAcepto }) {
  const [estado, accion, pendiente] = useActionState(elegirArtista, {});
  const [acepta, setAcepta] = useState(false);
  const artista = estado.esArtista ?? esArtista;
  const pideDeclaracion = !artista && !yaAcepto;

  return (
    <form action={accion} className="tarjeta flex flex-col gap-4 p-7">
      <input type="hidden" name="quiero" value={artista ? "no" : "si"} />
      <div>
        <h2 className="rotulo text-sm text-cobalto">Tipo de cuenta</h2>
        <p className="mt-2 leading-relaxed text-marino">
          {artista
            ? "Tu cuenta es de artista: podés subir tus temas y venderlos en la Disquería."
            : "¿Hacés música? Pasá tu cuenta a artista, subí tus temas y vendelos en la Disquería."}
        </p>
        {artista && (
          <Link href="/estudio" className="etiqueta mt-3 text-cobalto hover:text-marino">
            Ir a Mi música
          </Link>
        )}
      </div>

      {pideDeclaracion && (
        <label className="flex items-start gap-3 text-sm leading-relaxed text-marino">
          <input
            type="checkbox"
            name="acepto"
            value="si"
            checked={acepta}
            onChange={(e) => setAcepta(e.target.checked)}
            className="mt-1 size-4 shrink-0 accent-cobalto"
          />
          <span>{DECLARACION_DERECHOS}</span>
        </label>
      )}

      {estado.error && (
        <p role="alert" className="border-l-2 border-cobalto bg-white/70 px-3 py-2 text-sm text-marino">
          {estado.error}
        </p>
      )}
      {estado.ok && (
        <p role="status" className="border-l-2 border-lavanda bg-white/70 px-3 py-2 text-sm text-marino">
          {estado.ok}
        </p>
      )}

      <button
        type="submit"
        disabled={pendiente || (pideDeclaracion && !acepta)}
        className={`self-start px-6 py-2.5 font-titular text-sm transition-shadow disabled:opacity-60 ${
          artista
            ? "border border-white bg-white/60 text-marino hover:bg-white"
            : "cartel hover:shadow-[0_0_24px_#7ff4ffb3]"
        }`}
      >
        {pendiente ? "Guardando…" : artista ? "Dejar de ser artista" : "Soy artista"}
      </button>
    </form>
  );
}
