"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { guardarCancion } from "@/app/estudio/acciones";
import { largosCancion, PESO_MAXIMO, tituloDesdeArchivo, TIPOS_DE_AUDIO } from "@/lib/estudio";
import { portadas } from "@/lib/redaccion";
import { crearClienteNavegador } from "@/lib/supabase/navegador";

const CAMPO =
  "border border-white bg-white/70 px-3 py-2.5 text-marino outline-none transition-shadow focus:shadow-[0_0_0_1px_#1f45d6,0_0_16px_#7ff4ffb3]";

/** Lee la duración en segundos con el reproductor del navegador. */
function leerDuracion(archivo) {
  return new Promise((resolver, rechazar) => {
    const url = URL.createObjectURL(archivo);
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      Number.isFinite(audio.duration) ? resolver(audio.duration) : rechazar();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      rechazar();
    };
    audio.src = url;
  });
}

/**
 * Sube con un link de subida firmado y `XMLHttpRequest`, que (a diferencia de
 * `fetch`) avisa cuánto lleva: con 10 MB, sin barra parece trabado.
 */
function subirConProgreso(url, archivo, alAvanzar) {
  return new Promise((resolver, rechazar) => {
    const pedido = new XMLHttpRequest();
    pedido.open("PUT", url);
    pedido.setRequestHeader("x-upsert", "false");
    pedido.upload.onprogress = (e) => e.lengthComputable && alAvanzar(e.loaded / e.total);
    pedido.onload = () => (pedido.status < 300 ? resolver() : rechazar(new Error(pedido.responseText)));
    pedido.onerror = () => rechazar(new Error("red"));
    const cuerpo = new FormData();
    cuerpo.append("cacheControl", "31536000");
    cuerpo.append("", archivo);
    pedido.send(cuerpo);
  });
}

/**
 * Subir un tema desde /estudio.
 *
 * El navegador lee la duración, sube el audio directo al bucket privado
 * `musica` (en la carpeta del artista) y después le pide al servidor que
 * guarde la fila. Si guardar falla, borra el archivo recién subido.
 *
 * @param {Object} props
 * @param {string} props.generoFicha - Género por defecto del tema.
 * @param {boolean} props.lleno - Ya tiene el máximo de temas.
 */
export default function SubirCancion({ generoFicha, lleno }) {
  const router = useRouter();
  const formulario = useRef(null);
  const [archivo, setArchivo] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [portada, setPortada] = useState(portadas[4].clases);
  const [progreso, setProgreso] = useState(null); // null = no está subiendo
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(null);

  function alElegir(e) {
    const elegido = e.target.files?.[0] ?? null;
    setError(null);
    setOk(null);
    if (!elegido) return setArchivo(null);
    if (!TIPOS_DE_AUDIO[elegido.type]) {
      e.target.value = "";
      setArchivo(null);
      return setError("Subí un MP3 o un M4A.");
    }
    if (elegido.size > PESO_MAXIMO) {
      e.target.value = "";
      setArchivo(null);
      return setError("El audio pesa más de 25 MB. Exportalo en MP3 a 320 kbps o menos.");
    }
    setArchivo(elegido);
    if (!titulo) setTitulo(tituloDesdeArchivo(elegido.name));
  }

  async function alEnviar(e) {
    e.preventDefault();
    if (!archivo) return setError("Elegí el audio.");
    const genero = String(new FormData(e.currentTarget).get("genero") ?? "").trim();
    setError(null);
    setOk(null);
    setProgreso(0);

    let duracion;
    try {
      duracion = await leerDuracion(archivo);
    } catch {
      setProgreso(null);
      return setError("No se pudo leer el audio. ¿Está bien el archivo?");
    }

    const supabase = crearClienteNavegador();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setProgreso(null);
      return setError("Se cerró tu sesión. Entrá de nuevo.");
    }

    const ruta = `${user.id}/${crypto.randomUUID()}.${TIPOS_DE_AUDIO[archivo.type]}`;
    const { data: firmado, error: errorFirma } = await supabase.storage
      .from("musica")
      .createSignedUploadUrl(ruta);
    try {
      if (errorFirma) throw errorFirma;
      await subirConProgreso(firmado.signedUrl, archivo, setProgreso);
    } catch {
      setProgreso(null);
      return setError("No se pudo subir el audio. Probá de nuevo.");
    }

    const resultado = await guardarCancion({ titulo, genero, portada, duracion, archivo: ruta });
    setProgreso(null);
    if (resultado.error) {
      await supabase.storage.from("musica").remove([ruta]);
      return setError(resultado.error);
    }

    setOk(resultado.ok);
    setArchivo(null);
    setTitulo("");
    formulario.current?.reset();
    router.refresh();
  }

  const subiendo = progreso !== null;

  if (lleno) {
    return (
      <p className="tarjeta p-7 text-sm leading-relaxed text-humo">
        Llegaste al máximo de temas. Borrá uno para subir otro.
      </p>
    );
  }

  return (
    <form ref={formulario} onSubmit={alEnviar} className="tarjeta flex flex-col gap-6 p-7">
      <div>
        <h2 className="rotulo text-sm text-cobalto">Subir un tema</h2>
        <p className="mt-2 text-sm leading-relaxed text-humo">
          MP3 o M4A, hasta 25 MB. Apenas lo subís, suena en Descubrimientos.
        </p>
      </div>

      <label className="flex flex-col gap-1">
        <span className="rotulo text-xs uppercase text-cobalto">Audio</span>
        <input
          required
          type="file"
          accept="audio/mpeg,audio/mp4,audio/x-m4a,.mp3,.m4a"
          onChange={alElegir}
          disabled={subiendo}
          className="text-sm text-marino file:mr-3 file:cursor-pointer file:border file:border-white file:bg-white/60 file:px-4 file:py-2 file:font-titular file:text-sm file:text-marino hover:file:bg-white"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="rotulo text-xs uppercase text-cobalto">Título</span>
        <input
          required
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={largosCancion.titulo}
          disabled={subiendo}
          className={CAMPO}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="rotulo text-xs uppercase text-cobalto">Género</span>
        <input
          name="genero"
          defaultValue={generoFicha}
          maxLength={largosCancion.genero}
          disabled={subiendo}
          className={CAMPO}
        />
        <span className="text-xs text-humo">Si lo dejás vacío, va el de tu ficha.</span>
      </label>

      <fieldset>
        <legend className="mb-2 rotulo text-xs uppercase text-cobalto">Color de la etiqueta del disco</legend>
        <div className="grid grid-cols-3 gap-2">
          {portadas.map((p) => (
            <label
              key={p.clases}
              title={p.nombre}
              className={`bruma relative block h-10 cursor-pointer border-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-cobalto ${
                portada === p.clases ? "border-cobalto" : "border-transparent"
              }`}
            >
              <span className={`block h-full w-full bg-gradient-to-br ${p.clases}`} />
              <input
                type="radio"
                name="portada"
                value={p.clases}
                checked={portada === p.clases}
                onChange={() => setPortada(p.clases)}
                className="sr-only"
              />
              <span className="sr-only">{p.nombre}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {subiendo && (
        <div role="status" className="flex flex-col gap-1">
          <div className="h-1 w-full bg-white/70">
            <div className="h-full bg-cobalto transition-[width]" style={{ width: `${Math.round(progreso * 100)}%` }} />
          </div>
          <span className="rotulo text-xs text-humo">Subiendo… {Math.round(progreso * 100)}%</span>
        </div>
      )}
      {error && (
        <p role="alert" className="border-l-2 border-cobalto bg-white/70 px-3 py-2 text-sm text-marino">
          {error}
        </p>
      )}
      {ok && (
        <p role="status" className="border-l-2 border-lavanda bg-white/70 px-3 py-2 text-sm text-marino">
          {ok}
        </p>
      )}

      <button
        type="submit"
        disabled={subiendo}
        className="cartel self-start px-7 py-2.5 font-titular text-sm transition-shadow hover:shadow-[0_0_24px_#7ff4ffb3] disabled:opacity-60"
      >
        {subiendo ? "Subiendo…" : "Subir tema"}
      </button>
    </form>
  );
}
