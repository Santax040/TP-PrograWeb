"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { aceptarDerechos } from "@/app/estudio/acciones";
import { DECLARACION_DERECHOS } from "@/lib/estudio";

/**
 * La declaración de derechos en /estudio, para los artistas que pasaron su
 * cuenta antes de que existiera. Hasta aceptarla no pueden subir ni vender
 * (la base lo exige igual).
 */
export default function FormularioDerechos() {
  const router = useRouter();
  const [acepta, setAcepta] = useState(false);
  const [pendiente, empezar] = useTransition();
  const [error, setError] = useState(null);

  function alEnviar(e) {
    e.preventDefault();
    empezar(async () => {
      const resultado = await aceptarDerechos();
      if (resultado.error) return setError(resultado.error);
      router.refresh();
    });
  }

  return (
    <form onSubmit={alEnviar} className="tarjeta flex flex-col gap-4 p-7">
      <div>
        <h2 className="rotulo text-sm text-cobalto">Antes de subir</h2>
        <p className="mt-2 text-sm leading-relaxed text-humo">
          Tus temas se pueden escuchar y vender en la revista. Para eso necesitamos que lo confirmes.
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm leading-relaxed text-marino">
        <input
          type="checkbox"
          checked={acepta}
          onChange={(e) => setAcepta(e.target.checked)}
          className="mt-1 size-4 shrink-0 accent-cobalto"
        />
        <span>{DECLARACION_DERECHOS}</span>
      </label>

      {error && (
        <p role="alert" className="border-l-2 border-cobalto bg-white/70 px-3 py-2 text-sm text-marino">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!acepta || pendiente}
        className="cartel self-start px-6 py-2.5 font-titular text-sm transition-shadow hover:shadow-[0_0_24px_#7ff4ffb3] disabled:opacity-60"
      >
        {pendiente ? "Guardando…" : "Aceptar"}
      </button>
    </form>
  );
}
