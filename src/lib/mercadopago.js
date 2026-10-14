import { MercadoPagoConfig, Payment } from "mercadopago";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { planes } from "@/lib/site";

/**
 * Integración con Mercado Pago (Checkout Pro). Solo se usa del lado del
 * servidor: el Access Token es secreto.
 *
 * El flujo: el botón de /suscribite crea una "preferencia" (el pedido de
 * cobro) y manda al usuario a pagar a la página de Mercado Pago. Al volver,
 * /suscribite/resultado le pregunta a Mercado Pago cómo salió el pago y, si
 * está aprobado, lo acredita: extiende la suscripción.
 */
export const mercadoPago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN ?? "",
});

/** Solo los planes pagos se pueden comprar. El precio sale siempre de acá. */
export function planPago(slug) {
  return planes.find((p) => p.slug === slug && p.precio > 0) ?? null;
}

/**
 * La referencia que viaja con cada pago para saber de quién es y qué compró.
 * Formato `usuario:plan`.
 */
export function armarReferencia(usuarioId, plan) {
  return `${usuarioId}:${plan}`;
}

function leerReferencia(referencia) {
  const [usuarioId, plan] = String(referencia ?? "").split(":");
  return usuarioId && plan ? { usuarioId, plan } : null;
}

/**
 * Consulta un pago en Mercado Pago y, si está aprobado y el monto coincide
 * con el precio del plan, lo acredita. Se puede llamar varias veces con el
 * mismo pago: la base lo acredita una sola vez.
 *
 * Nunca se confía en lo que viene en la URL de vuelta: el estado, el monto y
 * la referencia salen de la respuesta de Mercado Pago.
 *
 * @param {string|number} pagoId
 * @returns {Promise<{ estado: string, plan: string|null, usuarioId: string|null, hasta: string|null }>}
 */
export async function verificarYAcreditar(pagoId) {
  const pago = await new Payment(mercadoPago).get({ id: pagoId });
  const ref = leerReferencia(pago.external_reference);
  const plan = ref ? planPago(ref.plan) : null;

  const base = {
    estado: pago.status ?? "desconocido",
    plan: plan?.slug ?? null,
    usuarioId: ref?.usuarioId ?? null,
    hasta: null,
  };

  if (pago.status !== "approved" || !plan) return base;

  if (pago.currency_id !== "ARS" || Number(pago.transaction_amount) !== plan.precio) {
    console.error("Pago con monto o moneda inesperados", pago.id);
    return { ...base, estado: "revisar" };
  }

  const { data: hasta, error } = await crearClienteAdmin().rpc("acreditar_pago", {
    p_pago_id: pago.id,
    p_usuario_id: ref.usuarioId,
    p_plan: plan.slug,
    p_monto: plan.precio,
  });
  if (error) throw error;

  return { ...base, hasta };
}
