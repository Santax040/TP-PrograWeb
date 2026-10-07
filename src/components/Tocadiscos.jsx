"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import FondoPortada from "@/components/FondoPortada";

/** Vueltas por minuto de un LP, pasadas a grados por segundo. */
const GRADOS_POR_SEGUNDO = (100 / 3) * 6;

/**
 * Lee "reducir movimiento" del sistema. Con `useSyncExternalStore` el valor se
 * mantiene al día si la persona lo cambia con la página abierta, y en el
 * servidor vale `false` sin romper la hidratación.
 */
function useReducirMovimiento() {
  return useSyncExternalStore(
    (avisar) => {
      const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
      consulta.addEventListener("change", avisar);
      return () => consulta.removeEventListener("change", avisar);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/** Ángulo en grados del puntero respecto del centro de un elemento. */
function anguloDesdeCentro(evento, elemento) {
  const caja = elemento.getBoundingClientRect();
  const x = evento.clientX - (caja.left + caja.width / 2);
  const y = evento.clientY - (caja.top + caja.height / 2);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

/**
 * Descubrimientos: el tocadiscos de la portada y la lista de canciones.
 *
 * Todavía no hay audio: cuando los artistas puedan subir sus temas, este mismo
 * disco los va a tocar. Por eso no hay botón de play: un play que no reproduce
 * nada sería una promesa sin cumplir (DESENCUENTROS.md #1).
 *
 * El disco gira solo a 33⅓, se puede agarrar y girar con el mouse o el dedo
 * (frena de a poco al soltarlo), y se pausa con un botón. Con "reducir
 * movimiento" arranca quieto.
 *
 * @param {Object} props
 * @param {Array<{slug: string, tema: string, artista: string, artistaSlug: string,
 *   duracion: string, genero: string, portada: string}>} props.canciones
 * @param {import("react").ReactNode} [props.intro] - Lo que va arriba de la lista.
 */
export default function Tocadiscos({ canciones, intro }) {
  const [elegido, setElegido] = useState(0);
  // null = la persona todavía no tocó el botón: manda la preferencia del sistema.
  const [preferencia, setPreferencia] = useState(null);
  const reducir = useReducirMovimiento();
  const girando = preferencia ?? !reducir;

  const disco = useRef(null);
  const fisica = useRef({ angulo: 0, velocidad: 0, arrastre: null });
  const girandoRef = useRef(girando);
  useEffect(() => {
    girandoRef.current = girando;
  }, [girando]);

  // El giro se dibuja fuera de React, cuadro por cuadro: actualizar estado 60
  // veces por segundo haría renderizar todo el componente sin necesidad.
  useEffect(() => {
    let cuadro;
    let antes = performance.now();
    function paso(ahora) {
      const dt = Math.min((ahora - antes) / 1000, 0.05);
      antes = ahora;
      const f = fisica.current;
      if (!f.arrastre) {
        const objetivo = girandoRef.current ? GRADOS_POR_SEGUNDO : 0;
        // Se acerca a la velocidad de un LP de a poco, como un plato real.
        f.velocidad += (objetivo - f.velocidad) * Math.min(1, dt * 1.6);
        f.angulo += f.velocidad * dt;
      }
      if (disco.current) disco.current.style.transform = `rotate(${f.angulo}deg)`;
      cuadro = requestAnimationFrame(paso);
    }
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, []);

  function alApretar(evento) {
    evento.currentTarget.setPointerCapture(evento.pointerId);
    fisica.current.arrastre = {
      ultimo: anguloDesdeCentro(evento, evento.currentTarget),
      tiempo: performance.now(),
    };
  }

  function alMover(evento) {
    const f = fisica.current;
    if (!f.arrastre) return;
    const ahora = performance.now();
    const angulo = anguloDesdeCentro(evento, evento.currentTarget);
    // Diferencia entre -180 y 180, para que cruzar el borde no dé un salto.
    let delta = angulo - f.arrastre.ultimo;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const dt = Math.max((ahora - f.arrastre.tiempo) / 1000, 0.001);
    f.angulo += delta;
    f.velocidad = delta / dt;
    f.arrastre = { ultimo: angulo, tiempo: ahora };
  }

  function alSoltar() {
    fisica.current.arrastre = null;
  }

  const actual = canciones[elegido];
  if (!actual) return null;

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
      <div className="relative z-20 flex flex-col gap-8 md:col-span-5">
        {intro}

        <div>
          <h2 className="font-ancha text-xl uppercase text-white [text-shadow:0_0_16px_#ffffffb3] sm:text-2xl">
            Descubrimientos
          </h2>
          <ol className="mt-4 border-t border-white/70">
            {canciones.map((cancion, i) => (
              <li key={cancion.slug} className="border-b border-white/70">
                <button
                  type="button"
                  aria-pressed={i === elegido}
                  onClick={() => setElegido(i)}
                  className={`grid w-full grid-cols-[2rem_1fr] items-baseline gap-2 px-2 py-3 text-left transition-colors ${
                    i === elegido ? "bg-white/60" : "hover:bg-white/30"
                  }`}
                >
                  <span className="rotulo text-sm text-humo">A{i + 1}</span>
                  <span className="flex min-w-0 items-baseline justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block font-medium leading-snug text-marino">{cancion.tema}</span>
                      <span className="mt-0.5 block truncate rotulo text-xs uppercase text-humo">
                        {cancion.artista}
                      </span>
                    </span>
                    <span className="shrink-0 rotulo text-xs text-humo">{cancion.duracion}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="relative md:col-span-7">
        {/* La funda: un marco blanco corrido detrás del disco, como el HUD. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-4 top-6 hidden aspect-square w-[88%] border border-white md:block"
        />

        <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
          {/* Contenedor redondo que recorta: el disco de adentro es un cuadrado
              que gira, y sin el recorte su diagonal empujaba la página hacia
              el costado en celular. */}
          <div
            role="img"
            aria-label={`Disco girando: ${actual.tema}, de ${actual.artista}. Se puede girar con el mouse o el dedo.`}
            onPointerDown={alApretar}
            onPointerMove={alMover}
            onPointerUp={alSoltar}
            onPointerCancel={alSoltar}
            className="absolute inset-[4%] cursor-grab touch-none select-none overflow-hidden rounded-full shadow-[0_30px_60px_-30px_#11303a99] active:cursor-grabbing"
          >
            <div ref={disco} className="vinilo absolute inset-0 rounded-full">
              {/* Etiqueta del disco: el color de la canción elegida. Gira con el disco. */}
              <div
                key={actual.slug}
                className="bruma etiqueta-disco absolute inset-[31%] overflow-hidden rounded-full border border-white/80"
              >
                <FondoPortada articulo={actual} sizes="12rem" />
                <span className="absolute inset-x-0 top-[14%] z-[2] text-center rotulo text-[0.55rem] uppercase text-white [text-shadow:0_1px_4px_#11303a]">
                  Artificial
                </span>
                <span className="absolute inset-x-0 bottom-[14%] z-[2] text-center rotulo text-[0.55rem] uppercase text-white [text-shadow:0_1px_4px_#11303a]">
                  Lado A {elegido + 1}
                </span>
              </div>
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 z-[3] h-[3%] w-[3%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cielo shadow-[inset_0_1px_2px_#11303a80]"
              />
            </div>
          </div>

          {/* El reflejo de la luz no gira: es lo que hace que se note el giro. */}
          <span aria-hidden="true" className="vinilo-brillo pointer-events-none absolute inset-[4%] rounded-full" />

          {/* Brazo del tocadiscos: se apoya cuando gira y se levanta en pausa. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            className="pointer-events-none absolute -right-[2%] -top-[2%] w-[42%] origin-[82%_14%] transition-transform duration-700 ease-out"
            style={{ transform: `rotate(${girando ? 31 : 0}deg)` }}
          >
            <circle cx="82" cy="14" r="9" fill="#f4fbfb" stroke="#11303a" strokeOpacity="0.4" />
            <circle cx="82" cy="14" r="3.5" fill="#11303a" fillOpacity="0.5" />
            <path d="M82 14 L80 70 L66 88" fill="none" stroke="#f4fbfb" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M82 14 L80 70 L66 88" fill="none" stroke="#11303a" strokeOpacity="0.25" strokeWidth="1" strokeLinecap="round" />
            <rect x="58" y="84" width="12" height="7" rx="1.5" transform="rotate(-50 64 88)" fill="#2347c6" />
          </svg>

        </div>

        <div className="mx-auto mt-6 flex max-w-[34rem] flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="rotulo text-xs uppercase text-humo">Sonando ahora</p>
            <p className="mt-1 text-xl font-medium leading-tight text-marino sm:text-2xl">
              {actual.tema}
            </p>
            <p className="mt-1 flex flex-wrap gap-x-4 rotulo text-xs uppercase text-humo">
              <span>{actual.duracion}</span>
              <span>{actual.genero}</span>
            </p>
            <Link
              href={`/artistas/${actual.artistaSlug}`}
              className="etiqueta mt-3 text-cobalto hover:text-marino"
            >
              {actual.artista}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setPreferencia(!girando)}
            className="cartel shrink-0 px-3 py-1.5 rotulo text-xs uppercase hover:bg-marino"
          >
            {girando ? "Pausar el disco" : "Girar el disco"}
          </button>
        </div>
      </div>
    </div>
  );
}
