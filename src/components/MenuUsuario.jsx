"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";
import { crearClienteNavegador } from "@/lib/supabase/navegador";

/**
 * Parte del header que depende de quién está mirando.
 *
 * Visitante: un botón "Entrar" que despliega iniciar sesión y registrarse.
 * Logueado: su nombre, que despliega perfil, configuración y cerrar sesión.
 *
 * Es un componente de cliente a propósito. Si el header leyera la sesión en
 * el servidor, todas las páginas pasarían a generarse en cada visita; así
 * siguen siendo estáticas y solo este pedacito consulta la sesión.
 */
export default function MenuUsuario() {
  const [perfil, setPerfil] = useState(undefined); // undefined = cargando
  const pathname = usePathname();
  const router = useRouter();

  // Se vuelve a consultar al cambiar de página: el login y el registro
  // terminan redirigiendo, y así el header se entera.
  useEffect(() => {
    const supabase = crearClienteNavegador();
    let vigente = true;

    async function cargar() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        if (vigente) setPerfil(null);
        return;
      }
      const { data: fila } = await supabase
        .from("perfiles")
        .select("nombre, rol, avatar_url")
        .eq("id", data.user.id)
        .maybeSingle();
      if (vigente) setPerfil(fila ?? { nombre: data.user.email, rol: "usuario" });
    }

    cargar();
    const { data: escucha } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === "SIGNED_OUT") setPerfil(null);
    });

    return () => {
      vigente = false;
      escucha.subscription.unsubscribe();
    };
  }, [pathname]);

  async function salir() {
    await crearClienteNavegador().auth.signOut();
    setPerfil(null);
    router.push("/");
    router.refresh();
  }

  // Mientras carga, un lugar vacío del mismo tamaño para que el header no salte.
  if (perfil === undefined) {
    return <span className="inline-block h-9 w-28" aria-hidden="true" />;
  }

  // Con Google, entrar y registrarse son lo mismo: un solo botón alcanza.
  if (perfil === null) {
    return (
      <Link
        href="/login"
        className="inline-block rounded-full border border-white/80 px-4 py-1.5 text-sm text-white transition-colors hover:bg-white/15"
      >
        Entrar
      </Link>
    );
  }

  return (
    <Desplegable
      etiquetaAccesible={`Menú de ${perfil.nombre}`}
      clasesBoton="rounded-full border border-white/80 py-1 pl-1 pr-3 text-white transition-colors hover:bg-white/15"
      etiqueta={
        <>
          {perfil.avatar_url && <Avatar url={perfil.avatar_url} tamano={28} />}
          <span
            className="max-w-36 truncate font-texto text-sm font-semibold normal-case text-white"
            title={perfil.nombre}
          >
            {perfil.nombre}
          </span>
          {perfil.rol === "admin" && <span className="etiqueta text-cian">Admin</span>}
        </>
      }
    >
      <Opcion href="/perfil">Perfil</Opcion>
      <Opcion href="/configuracion">Configuración</Opcion>
      <Opcion onClick={salir}>Cerrar sesión</Opcion>
    </Desplegable>
  );
}

/**
 * Botón que abre y cierra un panel de opciones.
 *
 * Se cierra al elegir una opción, al hacer clic afuera y al apretar Escape.
 * No usa `role="menu"`: para un panel de enlaces
 * alcanza con `aria-expanded`, y así se recorre con Tab como el resto del
 * header, sin prometer una navegación por flechas que no implementamos.
 */
function Desplegable({ etiqueta, etiquetaAccesible, clasesBoton, children }) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef(null);

  // Los escuchas se agregan solo mientras está abierto, y se sacan al cerrar.
  useEffect(() => {
    if (!abierto) return;

    function alApuntar(evento) {
      if (!caja.current?.contains(evento.target)) setAbierto(false);
    }
    function alTeclear(evento) {
      if (evento.key === "Escape") setAbierto(false);
    }

    document.addEventListener("pointerdown", alApuntar);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("pointerdown", alApuntar);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [abierto]);

  return (
    <div ref={caja} className="relative">
      <button
        type="button"
        aria-expanded={abierto}
        aria-label={etiquetaAccesible}
        onClick={() => setAbierto((v) => !v)}
        className={`inline-flex items-center gap-2 ${clasesBoton}`}
      >
        {etiqueta}
        <span
          aria-hidden="true"
          className={`text-[0.6em] leading-none transition-transform ${abierto ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {abierto && (
        // El clic en el panel cierra: cubre tanto el mouse como el Enter
        // sobre un enlace, que también dispara un evento de clic.
        //
        // En celular el botón queda a la izquierda del renglón y un panel
        // anclado a la derecha se saldría de la pantalla; desde `sm` la
        // navegación va alineada a la derecha y el anclaje se invierte.
        <ul
          onClick={() => setAbierto(false)}
          className="absolute left-0 top-full z-50 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-xl border border-white bg-white/85 p-1.5 shadow-[0_18px_40px_-18px_#0b1a3dcc] backdrop-blur-xl sm:left-auto sm:right-0"
        >
          {children}
        </ul>
      )}
    </div>
  );
}

function Opcion({ href, onClick, children }) {
  const clases =
    "block w-full rounded-lg px-3 py-2 text-left font-titular text-sm lowercase text-marino transition-colors hover:bg-cobalto hover:text-white";

  return (
    <li>
      {href ? (
        <Link href={href} className={clases}>
          {children}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={clases}>
          {children}
        </button>
      )}
    </li>
  );
}
