import Link from "next/link";
import Titular from "@/components/Titular";
import { verificarYAcreditarCompra } from "@/lib/compras";

export const metadata = {
  title: "Resultado de la compra",
  robots: { index: false },
};

/**
 * Vuelta de Mercado Pago después de comprar un tema (los `back_urls`).
 *
 * Como en /suscribite/resultado, lo que trae la URL lo puede escribir
 * cualquiera: el estado real se le pregunta a Mercado Pago. Si el pago está
 * aprobado, se acredita acá mismo; el aviso cubre a quien no vuelve al sitio.
 */
export default async function ResultadoCompraPage({ searchParams }) {
  const params = await searchParams;
  const pagoId = String(params.payment_id ?? params.collection_id ?? "");
  const cancionId = String(params.cancion ?? "");

  let resultado = { estado: ERRORES.includes(params.error) ? params.error : "sin-pago", titulo: null, artista: null };
  if (/^\d+$/.test(pagoId) && /^\d+$/.test(cancionId)) {
    try {
      resultado = await verificarYAcreditarCompra(pagoId, Number(cancionId));
    } catch (error) {
      console.error("No se pudo verificar el pago de un tema", pagoId, error?.status ?? error?.message);
      resultado = { estado: "preferencia-o-consulta", titulo: null, artista: null };
    }
  }

  const mensaje = mensajes[resultado.estado] ?? mensajes.rechazado;
  const aprobado = resultado.estado === "approved";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <header className="mb-12">
        <h1 className="text-5xl sm:text-7xl">
          <Titular texto={mensaje.titulo} volanta="Tu compra" />
        </h1>
      </header>

      <div className={`tarjeta max-w-2xl border-l-4 px-6 py-6 ${mensaje.borde}`} role="status">
        <p className="font-titular text-lg font-light text-marino">{mensaje.bajada}</p>
        {resultado.titulo && (
          <p className="mt-3 text-sm leading-relaxed text-humo">
            Tema: <strong className="text-marino">{resultado.titulo}</strong>
          </p>
        )}
        {aprobado && resultado.artista && (
          <p className="mt-3 text-sm leading-relaxed text-humo">La plata fue directo a {resultado.artista}.</p>
        )}
        <p className="mt-3 text-sm leading-relaxed text-humo">{mensaje.detalle}</p>
        {/^\d+$/.test(pagoId) && <p className="etiqueta mt-5 text-humo">Pago N.º {pagoId}</p>}
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        {aprobado && (
          // Un <a> y no un Link: es una descarga, no una página.
          <a
            href={`/api/canciones/${cancionId}/descarga`}
            className="cartel px-5 py-3 font-titular text-sm transition-shadow hover:shadow-[0_0_24px_#7ff4ffb3]"
          >
            Descargar
          </a>
        )}
        <Link href="/compras" className="px-5 py-3 font-titular text-sm text-humo hover:text-marino">
          Mis compras
        </Link>
        <Link href="/musica" className="px-5 py-3 font-titular text-sm text-humo hover:text-marino">
          Volver a Música
        </Link>
      </div>
    </div>
  );
}

/** Los `?error=` de la ruta de compra. Lo demás de la URL no elige el mensaje. */
const ERRORES = ["no-disponible", "propio", "monto", "preferencia"];

const LAVANDA = "!border-l-lavanda";
const COBALTO = "!border-l-cobalto";
const HUMO = "!border-l-humo";

const mensajes = {
  approved: {
    titulo: "Es tuyo",
    bajada: "Pago aprobado.",
    detalle: "Lo podés bajar ahora o cuando quieras desde Mis compras, aunque el artista lo retire.",
    borde: COBALTO,
  },
  pending: {
    titulo: "En camino",
    bajada: "El pago quedó pendiente.",
    detalle: "Pasa con algunos medios (efectivo, transferencia). Cuando Mercado Pago lo apruebe, aparece en Mis compras.",
    borde: LAVANDA,
  },
  in_process: {
    titulo: "En camino",
    bajada: "Mercado Pago está revisando el pago.",
    detalle: "Suele resolverse en unos minutos. Cuando se apruebe, aparece en Mis compras.",
    borde: LAVANDA,
  },
  rechazado: {
    titulo: "No salió",
    bajada: "El pago no se aprobó.",
    detalle: "No se te cobró nada. Podés probar de nuevo con otro medio de pago.",
    borde: HUMO,
  },
  revisar: {
    titulo: "Lo revisamos",
    bajada: "El pago llegó, pero no coincide con la compra.",
    detalle: "Escribinos con el número de pago y lo resolvemos a mano.",
    borde: HUMO,
  },
  "sin-cuenta": {
    titulo: "Lo revisamos",
    bajada: "No pudimos consultar el pago: el artista desconectó su cuenta de Mercado Pago.",
    detalle: "Si llegaste a pagar, escribinos con el número de pago y lo resolvemos a mano.",
    borde: HUMO,
  },
  "sin-tema": {
    titulo: "Algo falló",
    bajada: "No encontramos ese tema.",
    detalle: "Si llegaste a pagar, escribinos con el número de pago y lo resolvemos a mano.",
    borde: HUMO,
  },
  "no-disponible": {
    titulo: "No está a la venta",
    bajada: "Ese tema no se puede comprar en este momento.",
    detalle: "No se te cobró nada.",
    borde: HUMO,
  },
  propio: {
    titulo: "Ya es tuyo",
    bajada: "No hace falta comprar tus propios temas.",
    detalle: "Los podés bajar desde la lista de temas.",
    borde: HUMO,
  },
  monto: {
    titulo: "Revisá el monto",
    bajada: "El monto no llega al mínimo del tema o no es un número entero.",
    detalle: "No se te cobró nada. Probá de nuevo.",
    borde: HUMO,
  },
  preferencia: {
    titulo: "Algo falló",
    bajada: "No pudimos crear el pago en Mercado Pago.",
    detalle: "No se te cobró nada. Probá de nuevo en un rato.",
    borde: HUMO,
  },
  "preferencia-o-consulta": {
    titulo: "Algo falló",
    bajada: "No pudimos hablar con Mercado Pago.",
    detalle: "Si llegaste a pagar, el pago queda registrado y lo acreditamos. Probá recargar en un rato.",
    borde: HUMO,
  },
  "sin-pago": {
    titulo: "Música",
    bajada: "No hay ninguna compra para mostrar.",
    detalle: "Elegí un tema en la sección Música.",
    borde: HUMO,
  },
};
