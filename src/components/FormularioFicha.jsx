"use client";

import { useActionState } from "react";
import Link from "next/link";
import { guardarFicha } from "@/app/estudio/acciones";
import { largosFicha } from "@/lib/estudio";

const CAMPO =
  "border border-white bg-white/70 px-3 py-2.5 text-marino outline-none transition-shadow focus:shadow-[0_0_0_1px_#1f45d6,0_0_16px_#7ff4ffb3]";

/**
 * La ficha pública del artista: nombre, género y bio. Es la página
 * /artistas/<slug> y lo que firma sus temas en el tocadiscos.
 *
 * La dirección (slug) se arma con el nombre la primera vez y no cambia
 * después, para no romper links.
 *
 * @param {Object} props
 * @param {{ slug: string, nombre: string, genero: string, bio: string } | null} props.ficha
 */
export default function FormularioFicha({ ficha }) {
  const [estado, accion, pendiente] = useActionState(guardarFicha, {});
  const slug = estado.slug ?? ficha?.slug;

  return (
    <form action={accion} className="tarjeta flex flex-col gap-6 p-7">
      <div>
        <h2 className="rotulo text-sm text-cobalto">{ficha ? "Tu ficha" : "Armá tu ficha"}</h2>
        <p className="mt-2 text-sm leading-relaxed text-humo">
          {ficha
            ? "Es tu página en la revista y lo que firma tus temas."
            : "Antes de subir temas, contanos quién sos. Va a ser tu página en la revista."}
        </p>
      </div>

      <label className="flex flex-col gap-1">
        <span className="rotulo text-xs uppercase text-cobalto">Nombre de artista</span>
        <input required name="nombre" maxLength={largosFicha.nombre} defaultValue={ficha?.nombre} className={CAMPO} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="rotulo text-xs uppercase text-cobalto">Género</span>
        <input
          required
          name="genero"
          maxLength={largosFicha.genero}
          defaultValue={ficha?.genero}
          placeholder="Minimal, deep house, post-punk…"
          className={CAMPO}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="rotulo text-xs uppercase text-cobalto">Bio</span>
        <textarea name="bio" rows={4} maxLength={largosFicha.bio} defaultValue={ficha?.bio} className={CAMPO} />
        <span className="text-xs text-humo">Opcional. Hasta {largosFicha.bio} caracteres.</span>
      </label>

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

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button
          type="submit"
          disabled={pendiente}
          className="cartel px-7 py-2.5 font-titular text-sm transition-shadow hover:shadow-[0_0_24px_#7ff4ffb3] disabled:opacity-60"
        >
          {pendiente ? "Guardando…" : ficha ? "Guardar" : "Crear ficha"}
        </button>
        {slug && (
          <Link href={`/artistas/${slug}`} className="etiqueta text-cobalto hover:text-marino">
            Ver mi página
          </Link>
        )}
      </div>
    </form>
  );
}
