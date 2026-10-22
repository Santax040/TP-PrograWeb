"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import FondoPortada from "@/components/FondoPortada";
import LineaDeTiempo from "@/components/LineaDeTiempo";
import { useReproductor } from "@/components/Reproductor";

/** La etiqueta del disco cuando todavía no hay ningún tema cargado. */
const ETIQUETA_VACIA = { portada: "from-sky-500 via-blue-700 to-indigo-900" };

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

/** Tres barritas, en lugar del número del tema que está sonando. */
function IconoSonando() {
  return (
    <svg aria-label="Sonando" viewBox="0 0 12 12" className="inline size-3 fill-cobalto">
      <rect x="1" y="4" width="2" height="7" />
      <rect x="5" y="1" width="2" height="10" />
      <rect x="9" y="6" width="2" height="5" />
    </svg>
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
 * Descubrimientos: el tocadiscos de la portada y la lista de canciones, que
 * salen de la base (los temas que suben los artistas).
 *
 * Es un control del reproductor del sitio (`Reproductor.jsx`), no tiene audio
 * propio: elegir un tema lo hace sonar, y la música sigue si la persona se va
 * a otra página. Lo que hace el disco sale de lo que suena:
 * - Suena → el brazo baja y el disco gira a 33⅓.
 * - En pausa → el brazo se levanta y el disco frena de a poco.
 * - Agarrar el disco es apoyar la mano en el vinilo: mientras se sostiene, la
 *   música para; al soltarlo, sigue. Se puede girar con el mouse o el dedo.
 * - Con "reducir movimiento" el disco no gira, pero la música suena igual.
 *
 * Sin canciones en la base, el disco queda quieto y sin botón de play: un play
 * que no reproduce nada sería una promesa sin cumplir (DESENCUENTROS.md #1).
 *
 * @param {Object} props
 * @param {import("@/lib/musica").Cancion[]} props.canciones
 * @param {import("react").ReactNode} [props.intro] - Lo que va arriba de la lista.
 */
export default function Tocadiscos({ canciones, intro }) {
  const reproductor = useReproductor();
  const reducir = useReducirMovimiento();

  // El tema que muestra el plato: el que suena, si es de esta lista; si no,
  // el último que se eligió acá (al principio, el primero).
  const [elegidoAca, setElegidoAca] = useState(0);
  const indiceSonando = reproductor.actual
    ? canciones.findIndex((c) => c.id === reproductor.actual.id)
    : -1;
  const esDeAca = indiceSonando !== -1;
  const elegido = esDeAca ? indiceSonando : elegidoAca;
  const actual = canciones[elegido];

  const sonando = esDeAca && reproductor.sonando;
  const girando = sonando && !reducir;

  function tocar(i) {
    setElegidoAca(i);
    reproductor.tocar(canciones, i);
  }

  function alternarPua() {
    if (sonando) reproductor.pausar();
    else tocar(elegido);
  }

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
      // La mano sobre el vinilo frena la música; al soltar, sigue.
      retomar: sonando,
    };
    if (sonando) reproductor.pausar();
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
    f.arrastre = { ...f.arrastre, ultimo: angulo, tiempo: ahora };
  }

  function alSoltar() {
    const retomar = fisica.current.arrastre?.retomar;
    fisica.current.arrastre = null;
    if (retomar) reproductor.reanudar();
  }

  const etiqueta = actual ?? ETIQUETA_VACIA;

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
      <div className="relative z-20 flex flex-col gap-8 md:col-span-5">
        {intro}

        <div>
          <h2 className="font-ancha text-xl uppercase text-white [text-shadow:0_0_16px_#ffffffb3] sm:text-2xl">
            Descubrimientos
          </h2>
          {canciones.length === 0 && (
            <p className="mt-4 border-y border-white/70 px-2 py-3 text-humo">
              Todavía no hay temas en el plato. Pronto, lo que suban los artistas.
            </p>
          )}
          <ol className="mt-4 border-t border-white/70 empty:hidden">
            {canciones.map((cancion, i) => (
              <li key={cancion.id} className="border-b border-white/70">
                <button
                  type="button"
                  aria-pressed={i === elegido}
                  aria-label={`Escuchar ${cancion.tema}, de ${cancion.artista}`}
                  onClick={() => tocar(i)}
                  className={`grid w-full grid-cols-[2rem_1fr] items-baseline gap-2 px-2 py-3 text-left transition-colors ${
                    i === elegido ? "bg-white/60" : "hover:bg-white/30"
                  }`}
                >
                  <span className="rotulo text-sm text-humo">
                    {i === elegido && sonando ? <IconoSonando /> : `A${i + 1}`}
                  </span>
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
        <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
          {/* Contenedor redondo que recorta: el disco de adentro es un cuadrado
              que gira, y sin el recorte su diagonal empujaba la página hacia
              el costado en celular. */}
          <div
            role="img"
            aria-label={
              actual
                ? `Disco ${sonando ? "sonando" : "en pausa"}: ${actual.tema}, de ${actual.artista}. Sostenerlo frena la música.`
                : "Disco sin tema."
            }
            onPointerDown={alApretar}
            onPointerMove={alMover}
            onPointerUp={alSoltar}
            onPointerCancel={alSoltar}
            className="absolute inset-[4%] cursor-grab touch-none select-none overflow-hidden rounded-full shadow-[0_30px_60px_-30px_#11303a99] active:cursor-grabbing"
          >
            <div ref={disco} className="vinilo absolute inset-0 rounded-full">
              {/* Etiqueta del disco: el color de la canción elegida. Gira con el disco. */}
              <div
                key={actual?.id ?? "vacio"}
                className="bruma etiqueta-disco absolute inset-[31%] overflow-hidden rounded-full border border-white/80"
              >
                <FondoPortada articulo={etiqueta} sizes="12rem" />
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

          {/*
            Brazo del tocadiscos, estilo Technics: placa, base de pivote,
            contrapeso, brazo en S de aluminio, cabezal angulado con cápsula y
            aguja, y el apoyabrazo al costado.

            El dibujo usa las mismas coordenadas que el contenedor del disco
            (0 a 100): el disco tiene centro en (50, 50) y radio 46, y el
            pivote está en (93, 10). En pausa el brazo gira -8° y descansa en
            el apoyabrazo, afuera del disco; cuando suena, va a +4° y la aguja
            cae en los surcos de afuera, a radio 40 del centro. Sigue a la
            música, no al giro: con "reducir movimiento" el disco no gira pero
            el brazo igual baja.
          */}
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible [filter:drop-shadow(0_5px_5px_#11303a59)]"
          >
            <defs>
              <linearGradient id="brazo-metal" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#8d9ca2" />
                <stop offset="0.45" stopColor="#f7fbfb" />
                <stop offset="1" stopColor="#9eacb1" />
              </linearGradient>
              <radialGradient id="brazo-base" cx="0.4" cy="0.35" r="0.75">
                <stop offset="0" stopColor="#4b5c63" />
                <stop offset="1" stopColor="#152126" />
              </radialGradient>
              <linearGradient id="brazo-placa" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Placa donde se monta el brazo. */}
            <rect x="85" y="2" width="16" height="16" rx="2.5" fill="url(#brazo-placa)" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="0.3" />

            {/* Apoyabrazo: no gira; el brazo se apoya ahí en pausa. */}
            <rect x="97.4" y="51.6" width="3.4" height="5.2" rx="0.9" fill="url(#brazo-base)" />
            <path d="M97.9 52.4 Q99.1 54 100.3 52.4" fill="none" stroke="#c9d3d6" strokeWidth="0.5" strokeLinecap="round" />

            <g
              style={{
                transform: `rotate(${sonando ? 4 : -8}deg)`,
                transformOrigin: "93px 10px",
                transformBox: "view-box",
                transition: "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {/* Contrapeso, detrás del pivote, con estrías. */}
              <rect x="90.4" y="0.6" width="5.2" height="6" rx="1.1" fill="url(#brazo-metal)" stroke="#11303a" strokeOpacity="0.35" strokeWidth="0.25" />
              <path d="M90.6 2.2 H95.4 M90.6 3.6 H95.4 M90.6 5 H95.4" stroke="#11303a" strokeOpacity="0.25" strokeWidth="0.2" />

              {/* Brazo en S: contorno oscuro, aluminio y un filo de luz. */}
              <path d="M93 10 C93 27 89.6 35 91 45 S93 57 93 62" fill="none" stroke="#11303a" strokeOpacity="0.45" strokeWidth="2.3" strokeLinecap="round" />
              <path d="M93 10 C93 27 89.6 35 91 45 S93 57 93 62" fill="none" stroke="url(#brazo-metal)" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M92.7 12 C92.7 27 89.3 35 90.7 45" fill="none" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="0.3" strokeLinecap="round" />

              {/* Cabezal angulado 25° hacia el centro, con la pestaña para levantarlo. */}
              <polygon points="94.8,62.8 90.7,70.9 87.8,69.5 91.2,61.2" fill="#1b262a" stroke="#c9d3d6" strokeWidth="0.25" />
              <path d="M90.7 70.9 L93.3 72" stroke="url(#brazo-metal)" strokeWidth="0.8" strokeLinecap="round" />

              {/* Cápsula y aguja. */}
              <rect x="88.8" y="66" width="3" height="3.6" rx="0.4" transform="rotate(25 90.3 67.9)" fill="#2347c6" />
              <line x1="89.2" y1="70.2" x2="88.8" y2="71.2" stroke="#e8eef0" strokeWidth="0.35" strokeLinecap="round" />

              {/* Base del pivote, arriba de todo. */}
              <circle cx="93" cy="10" r="5.4" fill="url(#brazo-base)" />
              <circle cx="93" cy="10" r="3.6" fill="none" stroke="#c9d3d6" strokeOpacity="0.8" strokeWidth="0.35" />
              <circle cx="93" cy="10" r="1.5" fill="url(#brazo-metal)" />
            </g>
          </svg>

        </div>

        {actual && (
          <div className="mx-auto mt-6 max-w-[34rem]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="rotulo text-xs uppercase text-humo">
                  {sonando ? "Sonando ahora" : "En el plato"}
                </p>
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
                onClick={alternarPua}
                aria-label={sonando ? `Pausar ${actual.tema}` : `Escuchar ${actual.tema}`}
                className="cartel flex shrink-0 items-center gap-2 px-3 py-1.5 rotulo text-xs uppercase hover:bg-marino"
              >
                {sonando ? "Levantar la púa" : "Bajar la púa"}
              </button>
            </div>
            {/* La línea de tiempo aparece cuando este tema ya está cargado. */}
            {esDeAca && <LineaDeTiempo conTiempos className="mt-5" />}
          </div>
        )}
      </div>
    </div>
  );
}
