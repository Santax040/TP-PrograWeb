import { NextResponse } from "next/server";
import { Preference } from "mercadopago";
import { obtenerSesion } from "@/lib/sesion";
import { armarReferencia, mercadoPago, planPago } from "@/lib/mercadopago";

/**
 * Botón "Pagar con Mercado Pago" de /suscribite.
 *
 * Recibe solo el plan elegido; el precio lo pone el servidor. Crea la
 * preferencia (el pedido de cobro) y manda al usuario a pagar a Mercado Pago.
 * Las respuestas son 303 para que el navegador pase de POST a GET.
 */
export async function POST(request) {
  const origen = new URL(request.url).origin;
  const volver = (ruta) => NextResponse.redirect(`${origen}${ruta}`, 303);

  const { user } = await obtenerSesion();
  if (!user) return volver("/login?siguiente=/suscribite");

  const formulario = await request.formData();
  const plan = planPago(formulario.get("plan"));
  if (!plan) return volver("/suscribite");

  // APP_URL solo cuenta si es una dirección pública con HTTPS: Mercado Pago
  // rechaza auto_return con localhost.
  const appUrl = process.env.APP_URL?.trim().replace(/\/$/, "") ?? "";
  const publica =
    /^https:\/\//i.test(appUrl) &&
    !/^https:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|\/|$)/i.test(appUrl)
      ? appUrl
      : null;
  const base = publica ?? origen;

  try {
    const preferencia = await new Preference(mercadoPago).create({
      body: {
        items: [
          {
            id: `suscripcion-${plan.slug}`,
            title: `Suscripción ${plan.nombre} · Artificial`,
            quantity: 1,
            unit_price: plan.precio,
            currency_id: "ARS",
          },
        ],
        // Sin `payer.email` a propósito: el mail del sitio puede ser el de la
        // cuenta vendedora o no coincidir con la cuenta que paga, y Mercado
        // Pago bloquea el pago. Quién compró se sabe por external_reference.
        external_reference: armarReferencia(user.id, plan.slug),
        back_urls: {
          success: `${base}/suscribite/resultado`,
          failure: `${base}/suscribite/resultado`,
          pending: `${base}/suscribite/resultado`,
        },
        // Mercado Pago rechaza auto_return con localhost: solo en una
        // dirección pública con HTTPS. (El aviso por webhook, notification_url,
        // se suma cuando exista su ruta.)
        ...(publica ? { auto_return: "approved" } : {}),
        statement_descriptor: "ARTIFICIAL",
      },
    });

    // Siempre init_point: Mercado Pago ya no tiene un entorno sandbox aparte.
    return NextResponse.redirect(preferencia.init_point, 303);
  } catch (error) {
    console.error("No se pudo crear la preferencia de Mercado Pago", error);
    return volver("/suscribite/resultado?error=preferencia");
  }
}
