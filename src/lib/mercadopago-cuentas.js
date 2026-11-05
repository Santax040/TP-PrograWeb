import { crearClienteAdmin } from "@/lib/supabase/admin";

/**
 * Conectar la cuenta de Mercado Pago de un artista (OAuth del marketplace).
 * Solo del lado del servidor: maneja el secreto de la aplicación y los tokens
 * de los artistas, que se guardan en `privado.cuentas_mp` y nunca salen de ahí.
 *
 * El flujo: /api/mercadopago/conectar manda al artista a autorizar en Mercado
 * Pago, que lo devuelve a /api/mercadopago/conectar/vuelta con un código. Ese
 * código se canjea por los tokens de su cuenta.
 */

const URL_AUTORIZACION = "https://auth.mercadopago.com/authorization";
const URL_TOKEN = "https://api.mercadopago.com/oauth/token";

/** Renovar el token con este margen: una venta no debería encontrarlo vencido. */
const MARGEN_DE_RENOVACION = 7 * 24 * 60 * 60 * 1000;

/** ¿Están cargadas las credenciales de la aplicación marketplace? */
export function oauthConfigurado() {
  return Boolean(process.env.MP_CLIENT_ID && process.env.MP_CLIENT_SECRET);
}

/**
 * Tiene que ser idéntica a la registrada en la aplicación de Mercado Pago, y
 * la misma al pedir la autorización y al canjear el código. Mercado Pago no
 * acepta parámetros extra: lo que haga falta viaja en `state`.
 */
function direccionDeVuelta(origen) {
  const base = process.env.APP_URL?.trim().replace(/\/$/, "") || origen;
  return `${base}/api/mercadopago/conectar/vuelta`;
}

/**
 * APP_URL, solo si es una dirección pública con HTTPS. Mercado Pago rechaza
 * `auto_return` y los avisos con localhost.
 *
 * @returns {string|null}
 */
export function direccionPublica() {
  const url = process.env.APP_URL?.trim().replace(/\/$/, "") ?? "";
  const publica = /^https:\/\//i.test(url) && !/^https:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|\/|$)/i.test(url);
  return publica ? url : null;
}

/** @param {string} state - Al azar por intento, para reconocer la vuelta. */
export function urlDeConexion(state, origen) {
  const url = new URL(URL_AUTORIZACION);
  url.search = new URLSearchParams({
    client_id: process.env.MP_CLIENT_ID,
    response_type: "code",
    platform_id: "mp",
    state,
    redirect_uri: direccionDeVuelta(origen),
  });
  return url.toString();
}

/** Los pedidos a /oauth/token. Solo el estado en el error: la respuesta puede traer datos que no van en un log. */
async function pedirTokens(cuerpo) {
  const respuesta = await fetch(URL_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.MP_CLIENT_ID,
      client_secret: process.env.MP_CLIENT_SECRET,
      ...cuerpo,
    }),
    cache: "no-store",
  });
  if (!respuesta.ok) {
    throw Object.assign(new Error(`Mercado Pago rechazó el pedido de tokens (${respuesta.status})`), {
      status: respuesta.status,
    });
  }

  const tokens = await respuesta.json();
  if (!tokens.access_token || !tokens.refresh_token || !tokens.user_id || !tokens.expires_in) {
    throw new Error("Mercado Pago respondió sin los datos de la cuenta");
  }
  return tokens;
}

async function guardarTokens(perfilId, tokens) {
  const { error } = await crearClienteAdmin().rpc("guardar_cuenta_mp", {
    p_perfil_id: perfilId,
    p_mp_user_id: tokens.user_id,
    p_access_token: tokens.access_token,
    p_refresh_token: tokens.refresh_token,
    p_public_key: tokens.public_key ?? null,
    p_expira_en: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
  });
  if (error) throw new Error(`No se pudo guardar la cuenta (${error.code})`);
}

/**
 * Canjea el código de la vuelta por los tokens del artista y los guarda. La
 * base habilita la venta en su ficha, y rechaza la cuenta si no es de artista,
 * no tiene ficha o no aceptó la declaración de derechos.
 *
 * Con fetch y no con la clase `OAuth` del SDK: esa manda además el token de
 * `mercadoPago`, que es de las suscripciones y puede ser de otra aplicación.
 */
export async function conectarCuenta(perfilId, code, origen) {
  const tokens = await pedirTokens({
    grant_type: "authorization_code",
    code,
    redirect_uri: direccionDeVuelta(origen),
    // Con usuarios de prueba, Mercado Pago tiene que dar credenciales de prueba.
    ...(process.env.MP_CUENTAS_DE_PRUEBA === "true" ? { test_token: "true" } : {}),
  });
  await guardarTokens(perfilId, tokens);
}

/**
 * La configuración del SDK para cobrar y consultar pagos en la cuenta del
 * artista, o null si no se puede.
 *
 * Renueva el token si le falta poco para vencer; cada renovación cambia también
 * el `refresh_token`. Si la renovación falla pero el token sigue vigente, se usa
 * igual. Si ya venció y Mercado Pago lo rechaza, hay que autorizar de nuevo: se
 * desconecta, y /estudio le ofrece al artista volver a conectar.
 *
 * @returns {Promise<{ accessToken: string }|null>}
 */
export async function configDelVendedor(perfilId) {
  const { data, error } = await crearClienteAdmin().rpc("leer_cuenta_mp", { p_perfil_id: perfilId });
  if (error) throw new Error(`No se pudo leer la cuenta (${error.code})`);
  const cuenta = data?.[0];
  if (!cuenta) return null;

  const restante = new Date(cuenta.expira_en).getTime() - Date.now();
  if (restante > MARGEN_DE_RENOVACION) return { accessToken: cuenta.access_token };
  if (!oauthConfigurado()) return restante > 0 ? { accessToken: cuenta.access_token } : null;

  try {
    const tokens = await pedirTokens({ grant_type: "refresh_token", refresh_token: cuenta.refresh_token });
    await guardarTokens(perfilId, tokens);
    return { accessToken: tokens.access_token };
  } catch (motivo) {
    console.error("No se pudo renovar el token de un artista", motivo.message);
    if (restante > 0) return { accessToken: cuenta.access_token };
    // Solo 400, el del token rechazado: un 401 sería el secreto mal cargado de la revista.
    if (motivo.status === 400) await desconectarCuenta(perfilId);
    return null;
  }
}

/** Borra los tokens y deshabilita la venta en la ficha. Los temas siguen sonando. */
export async function desconectarCuenta(perfilId) {
  const { error } = await crearClienteAdmin().rpc("borrar_cuenta_mp", { p_perfil_id: perfilId });
  if (error) throw new Error(`No se pudo borrar la cuenta (${error.code})`);
}
