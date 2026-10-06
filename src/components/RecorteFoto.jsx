"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Tamaño final de las portadas: 16:9, suficiente para la cabecera a pantalla completa. */
export const ANCHO_PORTADA = 1600;
export const ALTO_PORTADA = 900;
const PROPORCION = ALTO_PORTADA / ANCHO_PORTADA;
const ZOOM_MAXIMO = 4;

/**
 * Ventana para encuadrar una foto en 16:9 antes de subirla.
 *
 * La foto se arrastra (mouse o dedo) y se acerca con la barra de zoom; con
 * el marco enfocado, las flechas la mueven y + / − cambian el zoom. Nunca
 * deja espacio vacío: la foto siempre cubre todo el marco.
 *
 * El marco usa `.bruma`, así se ve como va a quedar en la revista; "Ver
 * original" lo saca para encuadrar con los colores reales.
 *
 * Al confirmar, dibuja el recorte en un canvas de 1600×900 y lo devuelve
 * comprimido: WebP, o JPEG en los navegadores que no generan WebP (Safari).
 *
 * @param {Object} props
 * @param {string} props.url - Dirección temporal de la foto elegida
 *   (`URL.createObjectURL`); la crea y la libera quien abre esta ventana.
 * @param {(foto: Blob) => void} props.alConfirmar
 * @param {() => void} props.alCancelar
 */
export default function RecorteFoto({ url, alConfirmar, alCancelar }) {
  const dialogo = useRef(null);
  const marco = useRef(null);
  const imagen = useRef(null);
  const arrastre = useRef(null);

  const [natural, setNatural] = useState(null); // { w, h } de la foto original
  const [anchoMarco, setAnchoMarco] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [centro, setCentro] = useState(null); // punto de la foto que va al centro del marco
  const [original, setOriginal] = useState(false);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(false);

  // Abrir como modal: Escape cierra y el resto de la página queda inerte.
  useEffect(() => {
    dialogo.current?.showModal();
  }, []);

  // El marco cambia de ancho con la pantalla: se mide y se sigue.
  useEffect(() => {
    if (!marco.current) return;
    const observador = new ResizeObserver(([e]) => setAnchoMarco(e.contentRect.width));
    observador.observe(marco.current);
    return () => observador.disconnect();
  }, []);

  const altoMarco = anchoMarco * PROPORCION;
  // Escala con zoom 1: la foto cubre justo el marco.
  const escalaBase = natural ? Math.max(anchoMarco / natural.w, altoMarco / natural.h) : 1;
  const escala = escalaBase * zoom;

  /** El centro no puede ir tan al borde que quede espacio vacío. */
  const limitar = useCallback(
    (c, z = zoom) => {
      if (!natural || !anchoMarco) return c;
      const s = escalaBase * z;
      const medioAncho = anchoMarco / 2 / s;
      const medioAlto = altoMarco / 2 / s;
      return {
        x: Math.min(Math.max(c.x, medioAncho), natural.w - medioAncho),
        y: Math.min(Math.max(c.y, medioAlto), natural.h - medioAlto),
      };
    },
    [natural, anchoMarco, altoMarco, escalaBase, zoom],
  );

  function alCargar(e) {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    setNatural({ w, h });
    setCentro({ x: w / 2, y: h / 2 });
  }

  // El centro guardado puede quedar fuera de límites al alejar el zoom; el
  // que se usa para dibujar y recortar siempre se limita en el momento.
  const centroUsado = centro && limitar(centro);

  function mover(dx, dy) {
    setCentro((c) => {
      const actual = limitar(c);
      return limitar({ x: actual.x - dx / escala, y: actual.y - dy / escala });
    });
  }

  const ajustarZoom = (z) => Math.min(Math.max(z, 1), ZOOM_MAXIMO);

  // Con teclas se suma sobre el valor más reciente: si se mantiene apretada,
  // llegan muchas pulsaciones antes de que se vuelva a dibujar.
  function sumarZoom(paso) {
    setZoom((z) => ajustarZoom(z + paso));
  }

  // --- Arrastre (mouse, dedo o lápiz) ----------------------------------------
  function alApretar(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    arrastre.current = { x: e.clientX, y: e.clientY };
  }
  function alArrastrar(e) {
    if (!arrastre.current) return;
    mover(e.clientX - arrastre.current.x, e.clientY - arrastre.current.y);
    arrastre.current = { x: e.clientX, y: e.clientY };
  }
  function alSoltar() {
    arrastre.current = null;
  }

  function alTeclear(e) {
    const paso = e.shiftKey ? 40 : 10;
    const acciones = {
      ArrowLeft: () => mover(paso, 0),
      ArrowRight: () => mover(-paso, 0),
      ArrowUp: () => mover(0, paso),
      ArrowDown: () => mover(0, -paso),
      "+": () => sumarZoom(0.1),
      "=": () => sumarZoom(0.1),
      "-": () => sumarZoom(-0.1),
    };
    if (acciones[e.key]) {
      e.preventDefault();
      acciones[e.key]();
    }
  }

  // --- Recorte final -----------------------------------------------------------
  async function confirmar() {
    if (!natural || !centro) return;
    setProcesando(true);
    const lienzo = document.createElement("canvas");
    lienzo.width = ANCHO_PORTADA;
    lienzo.height = ALTO_PORTADA;
    const ctx = lienzo.getContext("2d");
    ctx.imageSmoothingQuality = "high";

    // La parte de la foto original que se ve en el marco.
    const anchoFuente = anchoMarco / escala;
    const altoFuente = altoMarco / escala;
    ctx.drawImage(
      imagen.current,
      centroUsado.x - anchoFuente / 2,
      centroUsado.y - altoFuente / 2,
      anchoFuente,
      altoFuente,
      0,
      0,
      ANCHO_PORTADA,
      ALTO_PORTADA,
    );

    const comoBlob = (tipo, calidad) =>
      new Promise((listo) => lienzo.toBlob(listo, tipo, calidad));
    let foto = await comoBlob("image/webp", 0.82);
    // Safari devuelve PNG si no sabe hacer WebP: ahí, JPEG.
    if (!foto || foto.type !== "image/webp") foto = await comoBlob("image/jpeg", 0.85);

    setProcesando(false);
    if (!foto) {
      setError("No se pudo procesar la foto. Probá con otra.");
      return;
    }
    dialogo.current?.close();
    alConfirmar(foto);
  }

  const chica = natural && natural.w < ANCHO_PORTADA / 2;
  const listo = natural && centro && anchoMarco > 0;

  return (
    <dialog
      ref={dialogo}
      onCancel={alCancelar}
      aria-labelledby="titulo-recorte"
      className="m-auto w-[min(56rem,calc(100vw-2rem))] max-w-none border border-white bg-cielo p-0 text-marino backdrop:bg-marino/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-5 p-5 sm:p-7">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="titulo-recorte" className="font-titular text-2xl">
            Encuadrar la portada
          </h2>
          <span className="rotulo text-sm text-humo">16:9</span>
        </div>

        <div
          ref={marco}
          tabIndex={0}
          role="application"
          aria-label="Foto a encuadrar. Arrastrala o usá las flechas para moverla, y + o − para el zoom."
          onPointerDown={alApretar}
          onPointerMove={alArrastrar}
          onPointerUp={alSoltar}
          onPointerCancel={alSoltar}
          onKeyDown={alTeclear}
          className={`relative aspect-video w-full cursor-grab touch-none select-none overflow-hidden border border-white bg-marino/20 outline-none focus-visible:shadow-[0_0_0_2px_#1f45d6] active:cursor-grabbing ${
            original ? "" : "bruma"
          }`}
        >
          {url && (
            // Primer hijo: es el que tiñe `.bruma`. Se posiciona a mano
            // (no con transform, que lo usa `.bruma`).
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imagen}
              src={url}
              alt=""
              draggable={false}
              onLoad={alCargar}
              onError={() => setError("No se pudo abrir esa imagen. Probá con una JPG o PNG.")}
              className="absolute max-w-none"
              style={
                listo
                  ? {
                      width: natural.w * escala,
                      height: natural.h * escala,
                      left: anchoMarco / 2 - centroUsado.x * escala,
                      top: altoMarco / 2 - centroUsado.y * escala,
                    }
                  : { opacity: 0 }
              }
            />
          )}
          {/* Tercios, para ayudar a encuadrar. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(to_right,transparent_33.2%,#ffffff66_33.3%,transparent_33.4%,transparent_66.6%,#ffffff66_66.7%,transparent_66.8%),linear-gradient(to_bottom,transparent_33.2%,#ffffff66_33.3%,transparent_33.4%,transparent_66.6%,#ffffff66_66.7%,transparent_66.8%)]"
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <label className="flex flex-1 items-center gap-3">
            <span className="rotulo text-sm text-cobalto">Zoom</span>
            <input
              type="range"
              min={1}
              max={ZOOM_MAXIMO}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(ajustarZoom(Number(e.target.value)))}
              disabled={!listo}
              className="flex-1 accent-cobalto"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={original}
              onChange={(e) => setOriginal(e.target.checked)}
              className="accent-cobalto"
            />
            Ver original
          </label>
        </div>

        <p className="text-sm leading-snug text-humo">
          Arrastrá la foto para encuadrarla. En la revista se ve con el tinte menta del sitio;
          la foto se guarda sin tinte.
          {chica && " Ojo: la foto es chica y se puede ver borrosa en pantallas grandes."}
        </p>

        {error && (
          <p role="alert" className="border-l-2 border-cobalto bg-white/70 px-3 py-2 text-sm">
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              dialogo.current?.close();
              alCancelar();
            }}
            className="border border-white bg-white/60 px-5 py-2.5 font-titular text-sm transition-colors hover:bg-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={!listo || procesando || Boolean(error)}
            className="cartel px-6 py-2.5 font-titular text-sm transition-shadow hover:shadow-[0_0_24px_#7ff4ffb3] disabled:opacity-60"
          >
            {procesando ? "Preparando…" : "Usar esta foto"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
