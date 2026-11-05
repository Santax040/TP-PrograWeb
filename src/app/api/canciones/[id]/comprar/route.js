import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { armarReferenciaDeCompra } from "@/lib/compras";
import { PRECIO_MAXIMO, PRECIO_MINIMO } from "@/lib/estudio";
import { configDelVendedor, direccionPublica } from "@/lib/mercadopago-cuentas";
import { obtenerSesion } from "@/lib/sesion";

/**
 * Botón "Comprar" de la lista de temas.
 *
 * El monto lo decide el servidor: es el precio del tema o, con "pagá lo que
 * quieras", el que eligió el comprador, si respeta el mínimo. La preferencia se
 * crea con el token del artista, así el pago entra directo a su cuenta. Sin
 * `marketplace_fee`: la revista no se queda con nada.
 *
 * Las respuestas son 303 para que el navegador pase de POST a GET.
 */
export async function POST(request, { params }) {
  const { id } = await params;
  const origen = new URL(request.url).origin;
  const volver = (ruta) => NextResponse.redirect(`${origen}${ruta}`, 303);
  const conError = (codigo) => volver(`/musica/resultado?error=${codigo}`);

  if (!/^\d+$/.test(id)) return conError("no-disponible");

  const { supabase, user } = await obtenerSesion();
  if (!user) return volver("/login?siguiente=/musica");

  const { data: cancion } = await supabase
    .from("canciones")
    .select("id, titulo, precio, paga_lo_que_quieras, publicada, retirada_en, artistas ( nombre, perfil_id, puede_vender )")
    .eq("id", id)
    .maybeSingle();
  if (!cancion?.publicada || cancion.retirada_en || cancion.precio === null) return conError("no-disponible");
  if (cancion.artistas?.perfil_id === user.id) return conError("propio");

  const { data: compra } = await supabase
    .from("compras")
    .select("id")
    .eq("cancion_id", id)
    .eq("usuario_id", user.id)
    .maybeSingle();
  if (compra) return volver("/compras");

  const formulario = await request.formData();
  const monto = cancion.paga_lo_que_quieras ? leerMonto(formulario.get("monto"), cancion.precio) : cancion.precio;
  if (monto === null) return conError("monto");

  if (monto === 0) {
    const { error } = await supabase.rpc("obtener_gratis", { p_cancion_id: cancion.id });
    return error ? conError("no-disponible") : volver("/compras");
  }

  const config = cancion.artistas?.puede_vender ? await configDelVendedor(cancion.artistas.perfil_id) : null;
  if (!config) return conError("no-disponible");

  // Mercado Pago rechaza `auto_return` y los avisos con localhost.
  const publica = direccionPublica();
  const base = publica ?? origen;
  const vuelta = `${base}/musica/resultado?cancion=${cancion.id}`;

  try {
    const preferencia = await new Preference(new MercadoPagoConfig(config)).create({
      body: {
        items: [
          {
            id: `tema-${cancion.id}`,
            title: `${cancion.titulo} · ${cancion.artistas.nombre}`.slice(0, 250),
            quantity: 1,
            unit_price: monto,
            currency_id: "ARS",
          },
        ],
        // Sin `payer.email`, como en las suscripciones: quién compró se sabe por
        // la referencia, y Mercado Pago bloquea el pago si el mail no coincide.
        external_reference: armarReferenciaDeCompra(user.id, cancion.id, monto),
        back_urls: { success: vuelta, failure: vuelta, pending: vuelta },
        ...(publica
          ? {
              auto_return: "approved",
              notification_url: `${publica}/api/mercadopago/aviso?cancion=${cancion.id}`,
            }
          : {}),
        statement_descriptor: "ARTIFICIAL",
      },
    });
    return NextResponse.redirect(preferencia.init_point, 303);
  } catch (error) {
    console.error("No se pudo crear la preferencia de un tema", cancion.id, error?.status ?? error?.message);
    return conError("preferencia");
  }
}

/** El monto de "pagá lo que quieras", o null si no respeta los límites. */
function leerMonto(valor, minimo) {
  const texto = String(valor ?? "").trim();
  if (!/^\d+$/.test(texto)) return null;
  const monto = Number(texto);
  if (monto === 0) return minimo === 0 ? 0 : null;
  return monto >= Math.max(minimo, PRECIO_MINIMO) && monto <= PRECIO_MAXIMO ? monto : null;
}
