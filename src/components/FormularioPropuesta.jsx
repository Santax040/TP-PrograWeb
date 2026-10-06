"use client";

import { startTransition, useActionState, useState } from "react";
import { mandarPropuesta } from "@/app/colabora/acciones";
import { tiposDeEnvio } from "@/lib/envios";
import { categorias } from "@/lib/site";

/**
 * Formulario de propuestas: el lector elige qué manda (nota, fecha o
 * artista) y aparecen los campos de ese tipo, definidos en `lib/envios.js`.
 *
 * Al mandarla, muestra la confirmación. "Mandar otra" monta un formulario
 * nuevo (cambia la `key`), así arranca vacío y sin el estado anterior.
 */
export default function FormularioPropuesta({ email }) {
  const [vuelta, setVuelta] = useState(0);
  return <Formulario key={vuelta} email={email} otraVez={() => setVuelta((v) => v + 1)} />;
}

function Formulario({ email, otraVez }) {
  const [estado, accion, pendiente] = useActionState(mandarPropuesta, {});
  const [tipo, setTipo] = useState("nota");

  // Se manda a mano en vez de con `<form action>`: con `action`, React 19
  // vacía el formulario después de cada envío, y eso devolvía la opción
  // elegida a "Una nota" aunque en pantalla siguieran los campos de otra.
  // Así, si hay un error, todo lo escrito queda como estaba.
  function enviar(evento) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    startTransition(() => accion(datos));
  }

  if (estado.ok) {
    return (
      <div role="status" className="tarjeta flex flex-col items-start gap-4 p-7">
        <p className="font-titular text-2xl font-semibold text-marino">Recibimos tu propuesta</p>
        <p className="leading-relaxed text-humo">
          «{estado.titulo}» le llegó al equipo. Si entra en la revista, te escribimos a{" "}
          <span className="font-semibold text-marino">{email}</span>.
        </p>
        <button
          type="button"
          onClick={otraVez}
          className="cartel mt-2 px-6 py-2.5 font-titular text-sm transition-shadow hover:shadow-[0_0_24px_#7ff4ffb3]"
        >
          Mandar otra
        </button>
      </div>
    );
  }

  const definicion = tiposDeEnvio[tipo];

  return (
    <form onSubmit={enviar} className="flex flex-col gap-8">
      <fieldset>
        <legend className="rotulo mb-3 text-sm text-marino">¿Qué nos querés mandar?</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Object.entries(tiposDeEnvio).map(([clave, t]) => {
            const elegido = clave === tipo;
            return (
              <label
                key={clave}
                className={`flex cursor-pointer flex-col gap-1 border p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-cobalto ${
                  elegido
                    ? "cartel"
                    : "border-white/80 bg-white/40 text-marino hover:bg-white/70"
                }`}
              >
                <input
                  type="radio"
                  name="tipo"
                  value={clave}
                  checked={elegido}
                  onChange={() => setTipo(clave)}
                  className="sr-only"
                />
                <span className="font-titular text-lg font-semibold">{t.nombre}</span>
                <span className={`text-sm leading-snug ${elegido ? "text-white/85" : "text-humo"}`}>
                  {t.bajada}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="tarjeta flex flex-col gap-6 p-7">
        {definicion.campos.map((campo) => (
          <Campo key={`${tipo}-${campo.nombre}`} campo={campo} />
        ))}

        <p className="text-sm text-humo">
          Te respondemos a <span className="font-semibold text-marino">{email}</span>.
        </p>

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
          {pendiente ? "Mandando…" : "Mandar propuesta"}
        </button>
      </div>
    </form>
  );
}

const claseEntrada =
  "w-full border border-white bg-white/70 px-3 py-2.5 text-marino outline-none transition-shadow focus:shadow-[0_0_0_1px_#1f45d6,0_0_16px_#7ff4ffb3]";

function Campo({ campo }) {
  const comunes = {
    name: campo.nombre,
    required: campo.obligatorio,
    className: claseEntrada,
  };

  let entrada;
  if (campo.tipo === "parrafo" || campo.tipo === "links") {
    entrada = (
      <textarea
        {...comunes}
        maxLength={campo.max}
        rows={campo.tipo === "links" ? 3 : campo.max > 5000 ? 12 : 5}
        className={`${claseEntrada} resize-y leading-relaxed`}
      />
    );
  } else if (campo.tipo === "categoria") {
    entrada = (
      <select {...comunes}>
        <option value="">Elegí una</option>
        {categorias.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.nombre}
          </option>
        ))}
      </select>
    );
  } else if (campo.tipo === "fecha") {
    entrada = <input type="date" {...comunes} />;
  } else {
    entrada = <input type="text" maxLength={campo.max} {...comunes} />;
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="rotulo text-sm text-cobalto">
        {campo.etiqueta}
        {!campo.obligatorio && <span className="font-normal text-humo"> (opcional)</span>}
      </span>
      {entrada}
      {campo.ayuda && <span className="text-xs leading-snug text-humo">{campo.ayuda}</span>}
    </label>
  );
}
