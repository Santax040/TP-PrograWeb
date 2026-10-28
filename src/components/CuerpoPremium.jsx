"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ParrafosNota from "@/components/ParrafosNota";
import { crearClienteNavegador } from "@/lib/supabase/navegador";

/**
 * Cuerpo de una nota exclusiva.
 *
 * La página es estática y trae solo el adelanto (el primer párrafo, o nada si
 * la nota tiene uno solo), que es lo único que la base le da a cualquiera. El texto completo está en
 * `articulos_premium` y la base lo entrega solo con sesión y suscripción
 * vigente (o al autor y al admin). Acá se pide con la sesión de quien mira:
 * si la base no lo da, queda el adelanto y la invitación a suscribirse.
 *
 * Esconder algo acá no protege nada: lo que decide es la política de la base.
 */
export default function CuerpoPremium({ articuloId, adelanto }) {
  const [completo, setCompleto] = useState(null);
  const [estado, setEstado] = useState("cargando"); // cargando | completo | sin-sesion | sin-suscripcion
  const pathname = usePathname();

  useEffect(() => {
    const supabase = crearClienteNavegador();
    let vigente = true;

    async function cargar() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        if (vigente) setEstado("sin-sesion");
        return;
      }
      const { data: fila } = await supabase
        .from("articulos_premium")
        .select("cuerpo")
        .eq("articulo_id", articuloId)
        .maybeSingle();
      if (!vigente) return;
      if (fila) {
        setCompleto(fila.cuerpo);
        setEstado("completo");
      } else {
        setEstado("sin-suscripcion");
      }
    }

    cargar();
    return () => {
      vigente = false;
    };
  }, [articuloId]);

  return (
    <>
      <ParrafosNota parrafos={completo ?? adelanto} />

      {(estado === "sin-sesion" || estado === "sin-suscripcion") && (
        <aside className="cartel mt-12 px-6 py-5">
          <p className="font-titular text-lg font-light">Nota exclusiva para suscriptores</p>
          <p className="mt-2 text-sm leading-relaxed text-white/80">
            {estado === "sin-sesion" ? (
              <>
                Para seguir leyendo,{" "}
                <Link
                  href={`/login?siguiente=${encodeURIComponent(pathname)}`}
                  className="text-cian underline underline-offset-4"
                >
                  entrá con tu cuenta
                </Link>{" "}
                o{" "}
                <Link href="/suscribite" className="text-cian underline underline-offset-4">
                  mirá los planes →
                </Link>
              </>
            ) : (
              <>
                Tu cuenta no tiene una suscripción vigente.{" "}
                <Link href="/suscribite" className="text-cian underline underline-offset-4">
                  Mirá los planes →
                </Link>
              </>
            )}
          </p>
        </aside>
      )}
    </>
  );
}
