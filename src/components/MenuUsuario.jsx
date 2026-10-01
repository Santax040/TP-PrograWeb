"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/navegador";

/**
 * Parte del header que depende de quién está mirando: "Entrar" para
 * visitantes, o el nombre y el botón de salir para quien inició sesión.
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
        .select("nombre, rol")
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
    return <span className="inline-block h-8 w-20" aria-hidden="true" />;
  }

  if (perfil === null) {
    return (
      <Link
        href="/login"
        className="papel inline-block rotate-1 px-3 py-1 transition-transform hover:rotate-0 hover:bg-acido"
      >
        Entrar
      </Link>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="max-w-40 truncate font-marcador normal-case text-acido" title={perfil.nombre}>
        {perfil.nombre}
      </span>
      {perfil.rol === "admin" && <span className="sello bg-papel text-xs">Admin</span>}
      <button
        type="button"
        onClick={salir}
        className="papel inline-block -rotate-1 px-2 py-1 uppercase transition-transform hover:rotate-0 hover:bg-sangre hover:text-papel"
      >
        Salir
      </button>
    </span>
  );
}
