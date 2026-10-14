import Link from "next/link";
import Titular from "@/components/Titular";
import { formatearFecha } from "@/lib/formato";
import { verificarYAcreditar } from "@/lib/mercadopago";

export const metadata = {
  title: "Resultado del pago",
  robots: { index: false },
};

/**
 * Vuelta de Mercado Pago después de pagar (los `back_urls` de la preferencia).
 *
 * Mercado Pago agrega `payment_id` (y `status`, entre otros) a la URL, pero
 * esos datos los puede escribir cualquiera: el estado real se le vuelve a
 * preguntar a Mercado Pago. Si el pago está aprobado, se acredita acá mismo;
 * así funciona también en local, donde no llegan los webhooks.
 */
export default async function ResultadoPage({ searchParams }) {
  const params = await searchParams;
  const pagoId = params.payment_id ?? params.collection_id;

  let resultado = { estado: params.error ? "error" : "sin-pago", hasta: null };
  if (pagoId && /^\d+$/.test(String(pagoId))) {
    try {
      resultado = await verificarYAcreditar(String(pagoId));
    } catch (error) {
      console.error("No se pudo verificar el pago", pagoId, error);
      resultado = { estado: "error", hasta: null };
    }
  }

  const mensaje = mensajes[resultado.estado] ?? mensajes.rechazado;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <header className="mb-12">
        <h1 className="text-5xl sm:text-7xl">
          <Titular texto={mensaje.titulo} volanta="Suscripción" />
        </h1>
      </header>

      <div
        className={`tarjeta max-w-2xl border-l-4 px-6 py-6 ${mensaje.borde}`}
        role="status"
      >
        <p className="font-titular text-lg font-light text-marino">{mensaje.bajada}</p>
        {resultado.estado === "approved" && resultado.hasta && (
          <p className="mt-3 text-sm leading-relaxed text-humo">
            Tu suscripción está activa hasta el{" "}
            <strong className="text-marino">{formatearFecha(resultado.hasta)}</strong>.
          </p>
        )}
        <p className="mt-3 text-sm leading-relaxed text-humo">{mensaje.detalle}</p>
        {pagoId && (
          <p className="etiqueta mt-5 text-humo">Pago N.º {String(pagoId)}</p>
        )}
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href={mensaje.enlace.href}
          className="cartel px-5 py-3 font-titular text-sm transition-shadow hover:shadow-[0_0_24px_#7ff4ffb3]"
        >
          {mensaje.enlace.texto}
        </Link>
        <Link href="/perfil" className="px-5 py-3 font-titular text-sm text-humo hover:text-marino">
          Ver mi perfil
        </Link>
      </div>
    </div>
  );
}

const mensajes = {
  approved: {
    titulo: "Listo",
    bajada: "Pago aprobado. Ya estás adentro.",
    detalle: "Las notas exclusivas ya se leen completas con tu cuenta.",
    borde: "!border-l-cobalto",
    enlace: { href: "/notas", texto: "Ir a las notas" },
  },
  pending: {
    titulo: "En camino",
    bajada: "El pago quedó pendiente.",
    detalle:
      "Pasa con algunos medios (efectivo, transferencia). Cuando Mercado Pago lo apruebe, la suscripción se activa sola.",
    borde: "!border-l-lavanda",
    enlace: { href: "/notas", texto: "Seguir leyendo" },
  },
  in_process: {
    titulo: "En camino",
    bajada: "Mercado Pago está revisando el pago.",
    detalle: "Suele resolverse en unos minutos. Cuando se apruebe, la suscripción se activa sola.",
    borde: "!border-l-lavanda",
    enlace: { href: "/notas", texto: "Seguir leyendo" },
  },
  rechazado: {
    titulo: "No salió",
    bajada: "El pago no se aprobó.",
    detalle: "No se te cobró nada. Podés probar de nuevo con otro medio de pago.",
    borde: "!border-l-humo",
    enlace: { href: "/suscribite", texto: "Volver a los planes" },
  },
  revisar: {
    titulo: "Lo revisamos",
    bajada: "El pago llegó, pero no coincide con el precio del plan.",
    detalle: "Escribinos y lo resolvemos a mano.",
    borde: "!border-l-humo",
    enlace: { href: "/suscribite", texto: "Volver a los planes" },
  },
  error: {
    titulo: "Algo falló",
    bajada: "No pudimos hablar con Mercado Pago.",
    detalle:
      "Si llegaste a pagar, no te preocupes: el pago queda registrado y lo acreditamos. Probá recargar en un rato.",
    borde: "!border-l-humo",
    enlace: { href: "/suscribite", texto: "Volver a los planes" },
  },
  "sin-pago": {
    titulo: "Suscribite",
    bajada: "No hay ningún pago para mostrar.",
    detalle: "Elegí un plan para empezar.",
    borde: "!border-l-humo",
    enlace: { href: "/suscribite", texto: "Ver los planes" },
  },
};
