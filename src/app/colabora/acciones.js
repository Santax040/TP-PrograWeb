"use server";

/**
 * Server Action del formulario de propuestas.
 *
 * 1. Valida los campos según `tiposDeEnvio` (la misma definición que arma el
 *    formulario).
 * 2. Guarda la propuesta en `envios` como el usuario logueado: los permisos
 *    de la base la dejan a su nombre y en estado "nuevo".
 * 3. Le avisa al admin por mail. Si el mail falla, la propuesta ya está
 *    guardada igual.
 */

import { revalidatePath } from "next/cache";
import { avisarNuevoEnvio } from "@/lib/aviso-envio";
import { esLinkValido, separarLinks, tiposDeEnvio } from "@/lib/envios";
import { categorias } from "@/lib/site";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export async function mandarPropuesta(_estado, formData) {
  const tipo = String(formData.get("tipo") ?? "");
  const definicion = tiposDeEnvio[tipo];
  if (!definicion) return { error: "Elegí qué querés mandar." };

  // Leer y validar cada campo del tipo elegido.
  const valores = {};
  for (const campo of definicion.campos) {
    const valor = String(formData.get(campo.nombre) ?? "").trim();
    valores[campo.nombre] = valor;

    if (campo.obligatorio && !valor) {
      return { error: `Falta completar "${campo.etiqueta}".` };
    }
    if (valor.length > campo.max) {
      return {
        error: `"${campo.etiqueta}" puede tener hasta ${campo.max} caracteres.`,
      };
    }
    if (valor && campo.tipo === "categoria" && !categorias.some((c) => c.slug === valor)) {
      return { error: "Elegí una sección de la lista." };
    }
    if (valor && campo.tipo === "fecha" && !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      return { error: "La fecha no es válida." };
    }
    if (valor && campo.tipo === "links") {
      const invalido = separarLinks(valor).find((l) => !esLinkValido(l));
      if (invalido) {
        return {
          error: `"${invalido}" no es un link. Tienen que empezar con https://`,
        };
      }
    }
  }

  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Se cerró tu sesión. Entrá de nuevo." };

  const { titulo, ...datos } = valores;
  // Los campos vacíos no se guardan.
  for (const clave of Object.keys(datos)) if (!datos[clave]) delete datos[clave];

  const { error } = await supabase.from("envios").insert({ tipo, titulo, datos });

  if (error) {
    // El trigger anti-spam marca su error con este hint.
    if (error.hint === "limite_envios") {
      return { error: "Ya mandaste 5 propuestas hoy. Probá de nuevo mañana." };
    }
    return { error: "No se pudo mandar. Probá de nuevo en un rato." };
  }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("nombre")
    .eq("id", user.id)
    .maybeSingle();

  await avisarNuevoEnvio({
    tipo,
    valores,
    autor: { nombre: perfil?.nombre ?? user.email, email: user.email },
  });

  revalidatePath("/colabora");
  return { ok: true, titulo };
}
