import { NextResponse } from "next/server";
import { verificarYAcreditarCompra } from "@/lib/compras";

/**
 * Aviso de Mercado Pago (la `notification_url` de las compras de temas): para
 * que los pagos pendientes, como efectivo o transferencia, se acrediten aunque
 * el comprador no vuelva al sitio.
 *
 * Cualquiera puede llamar a esta dirección, así que no se confía en lo que
 * trae: es solo la señal para ir a preguntarle a Mercado Pago por ese pago.
 *
 * Responde 200 salvo que la consulta falle, porque con otro código Mercado
 * Pago reintenta más tarde.
 */
export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const cuerpo = await request.json().catch(() => null);

  const cancionId = searchParams.get("cancion");
  const tipo = cuerpo?.type ?? searchParams.get("type") ?? searchParams.get("topic");
  const pagoId = String(cuerpo?.data?.id ?? searchParams.get("data.id") ?? searchParams.get("id") ?? "");

  if (tipo !== "payment" || !/^\d+$/.test(cancionId ?? "") || !/^\d+$/.test(pagoId)) {
    return new NextResponse(null, { status: 200 });
  }

  try {
    const { estado } = await verificarYAcreditarCompra(pagoId, Number(cancionId));
    if (estado === "sin-cuenta" || estado === "revisar") {
      console.error("Aviso de un pago que no se pudo acreditar", pagoId, estado);
    }
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    // No existe en la cuenta del artista: no tiene sentido que reintente.
    if (error?.status === 404) return new NextResponse(null, { status: 200 });
    console.error("No se pudo consultar el pago del aviso", pagoId, error?.status ?? error?.message);
    return new NextResponse(null, { status: 500 });
  }
}
