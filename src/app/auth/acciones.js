"use server";

/**
 * Server Actions de autenticación. Corren solo en el servidor: el formulario
 * las llama directamente, sin que tengamos que armar una API aparte.
 *
 * Cada una recibe `(estadoAnterior, formData)` porque los formularios las usan
 * con `useActionState`, que les pasa el resultado anterior para mostrar errores.
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/** Traduce los errores más comunes de Supabase al castellano. */
function traducirError(error) {
  const mensajes = {
    invalid_credentials: "Mail o contraseña incorrectos.",
    email_not_confirmed: "Todavía no confirmaste tu mail. Revisá tu casilla.",
    user_already_exists: "Ya hay una cuenta con ese mail.",
    email_exists: "Ya hay una cuenta con ese mail.",
    weak_password: "La contraseña es muy débil: usá al menos 8 caracteres.",
    over_email_send_rate_limit: "Se mandaron demasiados mails. Probá de nuevo en un rato.",
    over_request_rate_limit: "Demasiados intentos. Esperá un momento.",
  };
  return mensajes[error.code] ?? "Algo salió mal. Probá de nuevo.";
}

/** Solo se permite volver a rutas internas, para no redirigir a otro sitio. */
function rutaSegura(ruta) {
  return typeof ruta === "string" && ruta.startsWith("/") && !ruta.startsWith("//")
    ? ruta
    : "/";
}

export async function iniciarSesion(_estado, formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Completá mail y contraseña.", email };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: traducirError(error), email };

  redirect(rutaSegura(formData.get("siguiente")));
}

export async function registrarse(_estado, formData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const campos = { nombre, email };

  if (!nombre || !email || !password) {
    return { error: "Completá todos los campos.", ...campos };
  }
  if (nombre.length > 60) {
    return { error: "El nombre puede tener hasta 60 caracteres.", ...campos };
  }
  if (password.length < 8) {
    return { error: "La contraseña tiene que tener al menos 8 caracteres.", ...campos };
  }

  // A dónde vuelve el link del mail de confirmación.
  const origen = (await headers()).get("origin");

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // El trigger `crear_perfil` de la base toma este nombre para el perfil.
      data: { nombre },
      emailRedirectTo: `${origen}/auth/confirmar`,
    },
  });

  if (error) return { error: traducirError(error), ...campos };

  // Si el proyecto no pide confirmar el mail, ya quedó logueado.
  if (data.session) redirect("/");

  return { ok: `Te mandamos un mail a ${email}. Abrí el link para activar la cuenta.` };
}

// Cerrar sesión se hace desde el navegador (MenuUsuario), así el header se
// entera en el momento sin recargar la página.
