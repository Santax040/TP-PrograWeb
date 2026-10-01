"use server";

/**
 * Server Action de la página de configuración.
 *
 * Recibe `(estadoAnterior, formData)` porque el formulario la usa con
 * `useActionState`, igual que las de autenticación.
 */

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export async function cambiarNombre(_estado, formData) {
  const nombre = String(formData.get("nombre") ?? "").trim();

  if (!nombre) return { error: "Escribí un nombre." };
  if (nombre.length > 60) {
    return { error: "El nombre puede tener hasta 60 caracteres.", nombre };
  }

  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Se cerró tu sesión. Entrá de nuevo.", nombre };

  // El `eq` además de la política de la base: si alguien cambiara el id a
  // mano, la fila no sería suya y la base rechazaría el update igual.
  const { error } = await supabase.from("perfiles").update({ nombre }).eq("id", user.id);

  if (error) return { error: "No se pudo guardar el nombre. Probá de nuevo.", nombre };

  revalidatePath("/perfil");
  revalidatePath("/configuracion");

  return { ok: "Listo, cambiamos tu nombre.", nombre };
}
