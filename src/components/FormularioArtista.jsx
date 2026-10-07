"use client";

import { useActionState } from "react";
import { elegirArtista } from "@/app/configuracion/acciones";

/**
 * "Soy artista" en Configuración. Cambia la cuenta entre usuario y artista al
 * instante (lo decidió así el dueño de la revista: sin aprobación).
 *
 * El botón manda lo contrario de lo que la cuenta es ahora. La base solo deja
 * moverse entre esos dos roles.
 */
export default function FormularioArtista({ esArtista }) {
  const [estado, accion, pendiente] = useActionState(elegirArtista, {});
  const artista = estado.esArtista ?? esArtista;

  return (
    <form action={accion} className="tarjeta flex flex-col gap-4 p-7">
      <input type="hidden" name="quiero" value={artista ? "no" : "si"} />
      <div>
        <h2 className="rotulo text-sm text-cobalto">Tipo de cuenta</h2>
        <p className="mt-2 leading-relaxed text-marino">
          {artista
            ? "Tu cuenta es de artista. Cuando la revista tenga carga de música, vas a poder subir la tuya."
            : "¿Hacés música? Pasá tu cuenta a artista: cuando la revista tenga carga de música, vas a poder subir la tuya."}
        </p>
      </div>

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
        disabled={pendiente}
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
