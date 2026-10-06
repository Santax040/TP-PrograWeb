"use client";

import { useRef, useState } from "react";
import RecorteFoto from "@/components/RecorteFoto";
import { portadas } from "@/lib/redaccion";
import { crearClienteNavegador } from "@/lib/supabase/navegador";

/** Fotos más pesadas que esto ni se intentan abrir (las de cámara rondan 5-10 MB). */
const MAXIMO_ORIGINAL = 25 * 1024 * 1024;

/**
 * Portada de la nota en Redacción: una foto propia o uno de los gradientes.
 *
 * La foto se elige, se encuadra en 16:9 (RecorteFoto) y se sube a Supabase
 * Storage desde el navegador, con la sesión del usuario: los permisos del
 * bucket `portadas` solo dejan subir a admins y publicadores, en su carpeta.
 * La dirección pública viaja en el formulario como `portada_url`.
 *
 * El gradiente se elige igual aunque haya foto: es lo que se ve si después se
 * quita la foto.
 */
export default function CampoPortada({ gradienteInicial, fotoInicial }) {
  const [gradiente, setGradiente] = useState(gradienteInicial ?? portadas[0].clases);
  const [foto, setFoto] = useState(fotoInicial ?? "");
  const [urlElegida, setUrlElegida] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState(null);
  const selector = useRef(null);

  function alElegir(e) {
    const elegido = e.target.files?.[0];
    e.target.value = ""; // para poder elegir la misma foto otra vez
    if (!elegido) return;
    if (!elegido.type.startsWith("image/")) {
      setError("Eso no es una imagen.");
      return;
    }
    if (elegido.size > MAXIMO_ORIGINAL) {
      setError("La foto pesa más de 25 MB. Probá con una más chica.");
      return;
    }
    setError(null);
    // Dirección temporal para mostrarla en el recortador; se libera al cerrarlo.
    setUrlElegida(URL.createObjectURL(elegido));
  }

  function cerrarRecorte() {
    URL.revokeObjectURL(urlElegida);
    setUrlElegida(null);
  }

  async function subir(recortada) {
    cerrarRecorte();
    setSubiendo(true);
    setError(null);

    const supabase = crearClienteNavegador();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubiendo(false);
      setError("Se cerró tu sesión. Entrá de nuevo.");
      return;
    }

    const extension = recortada.type === "image/webp" ? "webp" : "jpg";
    const ruta = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: errorSubida } = await supabase.storage
      .from("portadas")
      .upload(ruta, recortada, { contentType: recortada.type, cacheControl: "31536000" });

    setSubiendo(false);
    if (errorSubida) {
      setError("No se pudo subir la foto. Probá de nuevo.");
      return;
    }
    setFoto(supabase.storage.from("portadas").getPublicUrl(ruta).data.publicUrl);
  }

  return (
    <fieldset className="tarjeta flex flex-col gap-4 p-6">
      <legend className="sr-only">Portada</legend>
      <p className="rotulo text-sm text-cobalto" aria-hidden="true">
        Portada
      </p>

      <input type="hidden" name="portada_url" value={foto} />
      <input
        ref={selector}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={alElegir}
        className="sr-only"
        tabIndex={-1}
      />

      {foto ? (
        // Vista previa con el tratamiento del sitio.
        <div className="bruma relative aspect-video border border-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto} alt="Portada elegida" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={() => selector.current?.click()}
          disabled={subiendo}
          className="border border-white bg-white/60 px-4 py-2 font-titular text-sm text-marino transition-colors hover:bg-white disabled:opacity-60"
        >
          {subiendo ? "Subiendo…" : foto ? "Cambiar foto" : "Subir foto"}
        </button>
        {foto && !subiendo && (
          <button
            type="button"
            onClick={() => setFoto("")}
            className="text-sm text-humo underline underline-offset-4 hover:text-marino"
          >
            Quitar foto
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="border-l-2 border-cobalto bg-white/70 px-3 py-2 text-sm text-marino">
          {error}
        </p>
      )}

      <div>
        <p className="mb-2 text-xs text-humo">
          {foto ? "Sin foto, se usa este color:" : "O elegí un color:"}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {portadas.map((p) => (
            <label
              key={p.clases}
              title={p.nombre}
              className={`bruma relative block h-10 cursor-pointer border-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-cobalto ${
                gradiente === p.clases ? "border-cobalto" : "border-transparent"
              }`}
            >
              <span className={`block h-full w-full bg-gradient-to-br ${p.clases}`} />
              <input
                type="radio"
                name="portada"
                value={p.clases}
                checked={gradiente === p.clases}
                onChange={() => setGradiente(p.clases)}
                className="sr-only"
              />
              <span className="sr-only">{p.nombre}</span>
            </label>
          ))}
        </div>
      </div>

      {urlElegida && (
        <RecorteFoto url={urlElegida} alConfirmar={subir} alCancelar={cerrarRecorte} />
      )}
    </fieldset>
  );
}
