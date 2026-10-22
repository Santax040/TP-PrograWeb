"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { rutaDeAudio } from "@/lib/audio";

const ContextoReproductor = createContext(null);

/**
 * Lo que suena y cómo manejarlo, desde cualquier componente de cliente que
 * esté adentro de `<Reproductor>` (o sea, cualquiera: lo monta el layout).
 */
export function useReproductor() {
  const contexto = useContext(ContextoReproductor);
  if (!contexto) throw new Error("useReproductor tiene que usarse adentro de <Reproductor>.");
  return contexto;
}

/**
 * El único `<audio>` del sitio. Vive en el layout, así la música no se corta
 * al pasar de una página a otra: el tocadiscos de la portada y la barra de
 * abajo son solo dos controles del mismo reproductor.
 *
 * Nada suena solo al cargar la página: siempre arranca con un clic (los
 * navegadores bloquean el audio automático, y además molesta).
 *
 * El audio se pide a `rutaDeAudio(id)`, que redirige a un link firmado que
 * vence en una hora. Si se vence con el tema en pausa, al darle play el
 * navegador falla; entonces se pide un link nuevo y se sigue desde donde
 * estaba.
 *
 * @param {Object} props
 * @param {import("react").ReactNode} props.children
 */
export default function Reproductor({ children }) {
  const audio = useRef(null);
  const [cola, setCola] = useState([]);
  const [indice, setIndice] = useState(0);
  const [sonando, setSonando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [tiempo, setTiempo] = useState(0);
  const [duracion, setDuracion] = useState(0);

  // Los eventos del <audio> (como "terminó") necesitan la cola de ahora, no la
  // del render en que se engancharon.
  const estado = useRef({ cola, indice });
  useEffect(() => {
    estado.current = { cola, indice };
  }, [cola, indice]);
  const reintento = useRef(null);

  const actual = cola[indice] ?? null;

  /** Carga un tema de la cola y lo hace sonar. Se llama desde un clic. */
  const cargar = useCallback((nuevaCola, i) => {
    const cancion = nuevaCola[i];
    const el = audio.current;
    if (!cancion || !el) return;
    setCola(nuevaCola);
    setIndice(i);
    setTiempo(0);
    setDuracion(0);
    reintento.current = null;
    el.src = rutaDeAudio(cancion.id);
    el.play().catch(() => {});
  }, []);

  const reanudar = useCallback(() => {
    audio.current?.play().catch(() => {});
  }, []);

  const pausar = useCallback(() => {
    audio.current?.pause();
  }, []);

  /** Elegir un tema: si es el que ya está cargado, sigue desde donde estaba. */
  const tocar = useCallback(
    (nuevaCola, i) => {
      const el = audio.current;
      const mismo = actual && nuevaCola[i]?.id === actual.id && el?.src;
      if (mismo) {
        setCola(nuevaCola);
        setIndice(i);
        reanudar();
      } else {
        cargar(nuevaCola, i);
      }
    },
    [actual, cargar, reanudar],
  );

  const alternar = useCallback(() => {
    const el = audio.current;
    if (!el || !actual) return;
    if (el.paused) reanudar();
    else pausar();
  }, [actual, pausar, reanudar]);

  const siguiente = useCallback(() => {
    const { cola, indice } = estado.current;
    if (indice + 1 < cola.length) cargar(cola, indice + 1);
  }, [cargar]);

  /** Como en cualquier reproductor: si ya avanzó, vuelve al principio del tema. */
  const anterior = useCallback(() => {
    const el = audio.current;
    const { cola, indice } = estado.current;
    if (el && el.currentTime > 3) el.currentTime = 0;
    else if (indice > 0) cargar(cola, indice - 1);
    else if (el) el.currentTime = 0;
  }, [cargar]);

  const buscar = useCallback((segundos) => {
    const el = audio.current;
    if (!el || !Number.isFinite(segundos)) return;
    el.currentTime = segundos;
    setTiempo(segundos);
  }, []);

  // Eventos del <audio>: el estado de React sigue al elemento, no al revés.
  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    const alSonar = () => {
      setSonando(true);
      setCargando(false);
    };
    const alPausar = () => setSonando(false);
    const alEsperar = () => setCargando(true);
    const alAvanzar = () => setTiempo(el.currentTime);
    const alSaberDuracion = () => {
      if (Number.isFinite(el.duration)) setDuracion(el.duration);
      // Link nuevo después de un error: seguir desde donde estaba.
      if (reintento.current != null) {
        el.currentTime = reintento.current;
        reintento.current = null;
      }
    };
    const alTerminar = () => {
      const { cola, indice } = estado.current;
      if (indice + 1 < cola.length) cargar(cola, indice + 1);
    };
    const alFallar = () => {
      setCargando(false);
      const { cola, indice } = estado.current;
      const cancion = cola[indice];
      // Un solo reintento por tema, para no quedar en un bucle si el
      // archivo de verdad no está.
      if (!cancion || reintento.current != null) return;
      reintento.current = el.currentTime || 0;
      el.src = rutaDeAudio(cancion.id);
      el.play().catch(() => {});
    };

    el.addEventListener("playing", alSonar);
    el.addEventListener("pause", alPausar);
    el.addEventListener("waiting", alEsperar);
    el.addEventListener("timeupdate", alAvanzar);
    el.addEventListener("loadedmetadata", alSaberDuracion);
    el.addEventListener("durationchange", alSaberDuracion);
    el.addEventListener("ended", alTerminar);
    el.addEventListener("error", alFallar);
    return () => {
      el.removeEventListener("playing", alSonar);
      el.removeEventListener("pause", alPausar);
      el.removeEventListener("waiting", alEsperar);
      el.removeEventListener("timeupdate", alAvanzar);
      el.removeEventListener("loadedmetadata", alSaberDuracion);
      el.removeEventListener("durationchange", alSaberDuracion);
      el.removeEventListener("ended", alTerminar);
      el.removeEventListener("error", alFallar);
    };
  }, [cargar]);

  // Teclas multimedia, auriculares y la pantalla bloqueada del celular.
  useEffect(() => {
    if (!("mediaSession" in navigator) || !actual) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: actual.tema,
      artist: actual.artista,
      album: "Artificial",
    });
    const acciones = {
      play: reanudar,
      pause: pausar,
      nexttrack: siguiente,
      previoustrack: anterior,
      seekto: (detalle) => buscar(detalle.seekTime),
    };
    for (const [accion, fn] of Object.entries(acciones)) {
      try {
        navigator.mediaSession.setActionHandler(accion, fn);
      } catch {
        // Algunos navegadores no tienen todas las acciones.
      }
    }
  }, [actual, reanudar, pausar, siguiente, anterior, buscar]);

  const valor = useMemo(
    () => ({
      actual,
      cola,
      indice,
      sonando,
      cargando,
      tiempo,
      duracion: duracion || actual?.duracionSeg || 0,
      hayAnterior: indice > 0,
      haySiguiente: indice + 1 < cola.length,
      tocar,
      alternar,
      pausar,
      reanudar,
      siguiente,
      anterior,
      buscar,
    }),
    [actual, cola, indice, sonando, cargando, tiempo, duracion, tocar, alternar, pausar, reanudar, siguiente, anterior, buscar],
  );

  return (
    <ContextoReproductor.Provider value={valor}>
      {children}
      {/* Sin controles propios: los dibujan el tocadiscos y la barra. */}
      <audio ref={audio} preload="none" className="hidden" />
    </ContextoReproductor.Provider>
  );
}
