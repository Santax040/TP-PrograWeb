"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { desconectarMercadoPago } from "@/app/estudio/acciones";

const MENSAJES = {
  ok: { texto: "Listo: tu cuenta de Mercado Pago quedó conectada." },
  cancelado: { texto: "No se conectó: la autorización quedó sin completar." },
  error: { texto: "No se pudo conectar Mercado Pago. Probá de nuevo.", error: true },
  "sin-configurar": { texto: "La revista todavía no habilitó las conexiones con Mercado Pago.", error: true },
};

/**
 * Cobros en /estudio: conectar o desconectar la cuenta de Mercado Pago del
 * artista. La venta le entra directo a esa cuenta.
 *
 * @param {Object} props
 * @param {boolean} props.conectado
 * @param {string} [props.resultado] - `?mp=` con el que vuelve de conectar.
 */
export default function BloqueCobros({ conectado, resultado }) {
  const router = useRouter();
  const [pendiente, empezar] = useTransition();
  const [error, setError] = useState(null);
  const mensaje = MENSAJES[resultado];

  function desconectar() {
    if (!window.confirm("¿Desconectar Mercado Pago? Tus temas pagos dejan de poder comprarse hasta que la conectes de nuevo, y un pago que esté pendiente no se va a acreditar solo.")) {
      return;
    }
    setError(null);
    empezar(async () => {
      const respuesta = await desconectarMercadoPago();
      if (respuesta.error) return setError(respuesta.error);
      // Sin `?mp=`: el aviso de la conexión anterior ya no corresponde.
      router.replace("/estudio");
      router.refresh();
    });
  }

  return (
    <section aria-labelledby="cobros" className="tarjeta flex flex-col gap-4 p-7">
      <div>
        <h2 id="cobros" className="rotulo text-sm text-cobalto">
          Cobros
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-humo">
          {conectado
            ? "Tu Mercado Pago está conectado. Lo que vendas entra directo a tu cuenta: la revista no se queda con nada."
            : "Para vender temas pagos, conectá tu Mercado Pago. Lo que vendas entra directo a tu cuenta: la revista no se queda con nada."}
        </p>
      </div>

      {mensaje && (
        <p
          role={mensaje.error ? "alert" : "status"}
          className={`border-l-2 bg-white/70 px-3 py-2 text-sm text-marino ${mensaje.error ? "border-cobalto" : "border-lavanda"}`}
        >
          {mensaje.texto}
        </p>
      )}
      {error && (
        <p role="alert" className="border-l-2 border-cobalto bg-white/70 px-3 py-2 text-sm text-marino">
          {error}
        </p>
      )}

      {conectado ? (
        <button
          type="button"
          disabled={pendiente}
          onClick={desconectar}
          className="self-start text-sm text-humo underline underline-offset-4 hover:text-marino disabled:opacity-60"
        >
          Desconectar Mercado Pago
        </button>
      ) : (
        // Un <a> y no un Link: sale del sitio, y un Link la pediría de antemano.
        <a
          href="/api/mercadopago/conectar"
          className="cartel self-start px-7 py-2.5 font-titular text-sm transition-shadow hover:shadow-[0_0_24px_#7ff4ffb3]"
        >
          Conectar Mercado Pago
        </a>
      )}
    </section>
  );
}
