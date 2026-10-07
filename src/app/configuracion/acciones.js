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

/**
 * Pasa la cuenta de usuario a artista o al revés. Lo hace la función
 * `elegir_ser_artista` de la base, que es la única que puede tocar el rol y
 * solo mueve entre esos dos.
 */
export async function elegirArtista(_estado, formData) {
  const quiero = formData.get("quiero") === "si";

  const supabase = await crearClienteServidor();
  const { data: rol, error } = await supabase.rpc("elegir_ser_artista", { quiero });

  if (error) return { error: "No se pudo cambiar el tipo de cuenta. Probá de nuevo." };

  revalidatePath("/perfil");
  revalidatePath("/configuracion");

  return {
    esArtista: rol === "artista",
    ok: rol === "artista" ? "Listo, tu cuenta ahora es de artista." : "Listo, tu cuenta volvió a ser de usuario.",
  };
}
