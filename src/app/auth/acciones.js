"use server";

/**
 * Entrar y crear cuenta con mail y contraseña (la otra opción es Google, que
 * va por BotonGoogle → /auth/confirmar).
 *
 * Reciben `(estadoAnterior, formData)` porque los formularios las usan con
 * `useActionState`. Al salir bien redirigen; si no, devuelven el error y lo
 * que se había escrito (menos la contraseña).
 *
 * Crear cuenta no pide confirmar el mail: el servicio de mails de Supabase sin
 * configuración propia solo le manda a los miembros del proyecto, así que el
 * mail de confirmación no le llegaría a nadie (ver BITACORA, entrada del
 * 2026-10-14).
 */

import { redirect } from "next/navigation";
import { LARGO_MINIMO_CLAVE } from "@/lib/cuenta";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/** Los errores más comunes de Supabase Auth, en castellano. */
function traducirError(error) {
  const mensajes = {
    invalid_credentials: "Mail o contraseña incorrectos.",
    user_already_exists: "Ya hay una cuenta con ese mail. Entrá con tu contraseña o con Google.",
    email_exists: "Ya hay una cuenta con ese mail. Entrá con tu contraseña o con Google.",
    weak_password: `La contraseña es muy débil: usá al menos ${LARGO_MINIMO_CLAVE} caracteres.`,
    email_address_invalid: "Ese mail no es válido.",
    signup_disabled: "Por ahora no se pueden crear cuentas con mail. Entrá con Google.",
    over_request_rate_limit: "Demasiados intentos. Esperá un momento.",
  };
  return mensajes[error.code] ?? "Algo salió mal. Probá de nuevo.";
}

/** Solo rutas internas, para que nadie arme un link que mande a otro sitio. */
function rutaSegura(ruta) {
  return typeof ruta === "string" && ruta.startsWith("/") && !ruta.startsWith("//") ? ruta : "/";
}

export async function entrarConMail(_estado, formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Completá mail y contraseña.", email };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: traducirError(error), email };

  redirect(rutaSegura(formData.get("siguiente")));
}

export async function crearCuenta(_estado, formData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const escrito = { nombre, email };

  if (!nombre || !email || !password) return { error: "Completá todos los campos.", ...escrito };
  if (nombre.length > 60) return { error: "El nombre puede tener hasta 60 caracteres.", ...escrito };
  if (password.length < LARGO_MINIMO_CLAVE) {
    return { error: `La contraseña tiene que tener al menos ${LARGO_MINIMO_CLAVE} caracteres.`, ...escrito };
  }

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // El trigger `crear_perfil` de la base toma este nombre para el perfil.
    options: { data: { nombre } },
  });

  if (error) return { error: traducirError(error), ...escrito };

  // Con un mail que ya existe, Supabase no da error (para no revelar qué mails
  // están registrados) pero tampoco abre sesión.
  if (!data.session) {
    return { error: "Ya hay una cuenta con ese mail. Entrá con tu contraseña o con Google.", ...escrito };
  }

  redirect(rutaSegura(formData.get("siguiente")));
}
