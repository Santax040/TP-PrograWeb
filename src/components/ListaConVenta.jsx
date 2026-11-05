"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { obtenerGratis } from "@/app/musica/acciones";
import ListaCanciones from "@/components/ListaCanciones";
import { etiquetaDePrecio, PRECIO_MAXIMO, PRECIO_MINIMO } from "@/lib/estudio";
import { crearClienteNavegador } from "@/lib/supabase/navegador";

const BOTON = "cartel shrink-0 px-4 py-2 font-titular text-sm transition-shadow hover:shadow-[0_0_24px_#7ff4ffb3] disabled:opacity-60";

/** Cobrar exige que el artista haya conectado su Mercado Pago. */
function seCobra(cancion) {
  return cancion.puedeVender && (cancion.precio > 0 || (cancion.precio === 0 && cancion.pagaLoQueQuieras));
}

/**
 * Los temas con lo que se puede hacer con cada uno: comprarlo, bajarlo gratis
 * o, si ya es tuyo, descargarlo.
 *
 * Lo que tiene quien mira se consulta en el navegador, como en `MenuUsuario`:
 * así las páginas siguen siendo estáticas. El precio y los permisos los vuelve
 * a controlar el servidor al comprar o descargar.
 *
 * @param {Object} props
 * @param {import("@/lib/musica").Cancion[]} props.canciones
 * @param {boolean} [props.conArtista] - Ver `ListaCanciones`.
 */
export default function ListaConVenta({ canciones, conArtista = false }) {
  const router = useRouter();
  const [pendiente, empezar] = useTransition();
  const [aviso, setAviso] = useState(null);
  const [comprados, setComprados] = useState(() => new Set());
  const [miSlug, setMiSlug] = useState(null);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      const supabase = crearClienteNavegador();
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const [{ data: compras }, { data: ficha }] = await Promise.all([
        supabase.from("compras").select("cancion_id").eq("usuario_id", data.user.id),
        supabase.from("artistas").select("slug").eq("perfil_id", data.user.id).maybeSingle(),
      ]);
      if (!vigente) return;
      setComprados(new Set((compras ?? []).map((c) => c.cancion_id)));
      setMiSlug(ficha?.slug ?? null);
    }

    cargar();
    return () => {
      vigente = false;
    };
  }, []);

  function esTuyo(cancion) {
    return comprados.has(cancion.id) || cancion.artistaSlug === miSlug;
  }

  function bajarGratis(cancion) {
    setAviso(null);
    empezar(async () => {
      const resultado = await obtenerGratis(cancion.id);
      if (resultado.login) return router.push(`/login?siguiente=${encodeURIComponent(window.location.pathname)}`);
      if (resultado.error) return setAviso(resultado.error);
      setComprados((antes) => new Set(antes).add(cancion.id));
      // Con un enlace: es una descarga, no una página.
      const enlace = document.createElement("a");
      enlace.href = `/api/canciones/${cancion.id}/descarga`;
      enlace.click();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <ListaCanciones
        canciones={canciones}
        conArtista={conArtista}
        extra={(cancion) => {
          if (esTuyo(cancion)) {
            return (
              // Un <a> y no un Link: es una descarga, no una página.
              <a href={`/api/canciones/${cancion.id}/descarga`} className={BOTON}>
                Descargar
              </a>
            );
          }
          const gratis = cancion.precio === 0;
          const cobra = seCobra(cancion);
          if (gratis) {
            return (
              <button type="button" disabled={pendiente} onClick={() => bajarGratis(cancion)} className={BOTON}>
                Bajar gratis
              </button>
            );
          }
          if (cobra && !cancion.pagaLoQueQuieras) {
            return (
              <form action={`/api/canciones/${cancion.id}/comprar`} method="post" className="shrink-0">
                <button type="submit" className={BOTON}>
                  Comprar
                </button>
              </form>
            );
          }
          return null;
        }}
        debajo={(cancion) => {
          if (esTuyo(cancion) || !seCobra(cancion)) return null;
          return (
            <div className="flex flex-col gap-2 pl-12">
              <p className="rotulo text-xs uppercase text-marino">
                {etiquetaDePrecio(cancion.precio, cancion.pagaLoQueQuieras)}
              </p>
              {cancion.pagaLoQueQuieras && (
                <form
                  action={`/api/canciones/${cancion.id}/comprar`}
                  method="post"
                  className="flex flex-wrap items-center gap-3"
                >
                  <label className="flex items-center gap-2 text-sm text-marino">
                    <span>Pagá $</span>
                    <input
                      required
                      name="monto"
                      type="number"
                      inputMode="numeric"
                      min={Math.max(cancion.precio, PRECIO_MINIMO)}
                      max={PRECIO_MAXIMO}
                      step={1}
                      defaultValue={Math.max(cancion.precio, PRECIO_MINIMO)}
                      className="w-28 border border-white bg-white/70 px-3 py-2 text-marino outline-none transition-shadow focus:shadow-[0_0_0_1px_#1f45d6,0_0_16px_#7ff4ffb3]"
                    />
                  </label>
                  <button type="submit" className={BOTON}>
                    Comprar
                  </button>
                </form>
              )}
              <p className="rotulo text-xs text-humo">La plata va directo a {cancion.artista}.</p>
            </div>
          );
        }}
      />
      {aviso && (
        <p role="alert" className="border-l-2 border-cobalto bg-white/70 px-3 py-2 text-sm text-marino">
          {aviso}
        </p>
      )}
    </div>
  );
}
