import { MercadoPagoConfig, Payment } from "mercadopago";
import { configDelVendedor } from "@/lib/mercadopago-cuentas";
import { crearClienteAdmin } from "@/lib/supabase/admin";

/**
 * Compras de temas. Solo del lado del servidor.
 *
 * El pago se hace y se consulta con el token del artista, porque entra a su
 * cuenta. Las suscripciones (`src/lib/mercadopago.js`) van aparte: esas cobran
 * en la cuenta de la revista.
 */

/**
 * La referencia que viaja con cada pago: `compra:<usuario>:<tema>:<monto>`. La
 * arma el servidor y el comprador no la puede cambiar. El monto va acá para
 * que un cambio de precio a mitad de la compra no rompa nada.
 */
export function armarReferenciaDeCompra(usuarioId, cancionId, monto) {
  return `compra:${usuarioId}:${cancionId}:${monto}`;
}

function leerReferencia(referencia) {
  const [tipo, usuarioId, cancionId, monto] = String(referencia ?? "").split(":");
  if (tipo !== "compra" || !usuarioId || !/^\d+$/.test(cancionId ?? "") || !/^\d+$/.test(monto ?? "")) return null;
  return { usuarioId, cancionId: Number(cancionId), monto: Number(monto) };
}

/**
 * Consulta un pago en la cuenta del artista y, si está aprobado y coincide con
 * la referencia, lo acredita. Se puede llamar varias veces con el mismo pago:
 * la base lo acredita una sola vez.
 *
 * Nunca se confía en lo que viene en la URL: que la consulta sea con el token
 * del artista de ese tema garantiza que el pago es de su cuenta, y el estado,
 * el monto y la referencia salen de la respuesta de Mercado Pago.
 *
 * @param {string|number} pagoId
 * @param {number} cancionId
 * @returns {Promise<{ estado: string, titulo: string|null, artista: string|null }>}
 *   `estado` es el de Mercado Pago, o `sin-tema`, `sin-cuenta` (el artista
 *   desconectó su cuenta) o `revisar` (el pago no coincide).
 */
export async function verificarYAcreditarCompra(pagoId, cancionId) {
  const admin = crearClienteAdmin();
  const { data: cancion } = await admin
    .from("canciones")
    .select("titulo, artistas ( nombre, perfil_id )")
    .eq("id", cancionId)
    .maybeSingle();
  if (!cancion) return { estado: "sin-tema", titulo: null, artista: null };

  const base = { titulo: cancion.titulo, artista: cancion.artistas?.nombre ?? null };

  const config = cancion.artistas?.perfil_id ? await configDelVendedor(cancion.artistas.perfil_id) : null;
  if (!config) return { ...base, estado: "sin-cuenta" };

  const pago = await new Payment(new MercadoPagoConfig(config)).get({ id: pagoId });
  if (pago.status !== "approved") return { ...base, estado: pago.status ?? "desconocido" };

  const ref = leerReferencia(pago.external_reference);
  if (
    !ref ||
    ref.cancionId !== Number(cancionId) ||
    pago.currency_id !== "ARS" ||
    Number(pago.transaction_amount) !== ref.monto
  ) {
    console.error("Pago de un tema con datos inesperados", pago.id);
    return { ...base, estado: "revisar" };
  }

  const { error } = await admin.rpc("acreditar_compra", {
    p_pago_id: pago.id,
    p_usuario_id: ref.usuarioId,
    p_cancion_id: ref.cancionId,
    p_monto: ref.monto,
  });
  if (error) throw error;

  return { ...base, estado: "approved" };
}
