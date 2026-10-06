/**
 * Mail al admin cuando llega una propuesta. Se usa solo desde el servidor
 * (la Server Action de /colabora): necesita la clave secreta de Resend, que
 * nunca tiene que llegar al navegador.
 *
 * Variables de entorno (en `.env.local` y en Vercel, sin `NEXT_PUBLIC_`):
 * - RESEND_API_KEY: la clave de Resend.
 * - AVISO_ENVIOS_PARA: a quién le llega. Sin dominio propio, Resend solo deja
 *   mandar al mail con el que se creó la cuenta.
 *
 * Si faltan, no se manda nada y la propuesta queda igual guardada en la base.
 */

import { categorias, site } from "@/lib/site";
import { separarLinks, tiposDeEnvio } from "@/lib/envios";

/** Escapa el texto del lector: en el mail va como texto, nunca como HTML. */
function escapar(texto) {
  return String(texto ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

function valorLegible(campo, valor) {
  if (campo.tipo === "categoria") {
    return escapar(categorias.find((c) => c.slug === valor)?.nombre ?? valor);
  }
  if (campo.tipo === "links") {
    // Ya vienen validados como http(s) desde la Server Action.
    return separarLinks(valor)
      .map((l) => `<a href="${escapar(l)}">${escapar(l)}</a>`)
      .join("<br>");
  }
  return escapar(valor).replace(/\n/g, "<br>");
}

/**
 * @param {Object} envio
 * @param {"nota" | "evento" | "artista"} envio.tipo
 * @param {Record<string, string>} envio.valores - Incluye `titulo`.
 * @param {{ nombre: string, email: string }} envio.autor
 * @returns {Promise<boolean>} Si el mail salió.
 */
export async function avisarNuevoEnvio({ tipo, valores, autor }) {
  const clave = process.env.RESEND_API_KEY;
  const para = process.env.AVISO_ENVIOS_PARA;
  if (!clave || !para) return false;

  const definicion = tiposDeEnvio[tipo];
  const filas = definicion.campos
    .filter((c) => valores[c.nombre])
    .map(
      (c) => `
        <tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top;color:#5b6b78;white-space:nowrap">${escapar(c.etiqueta)}</td>
          <td style="padding:8px 0;color:#14213d">${valorLegible(c, valores[c.nombre])}</td>
        </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px">
      <p style="color:#5b6b78;margin:0 0 4px">Propuesta nueva en ${escapar(site.nombre)}</p>
      <h2 style="color:#14213d;margin:0 0 16px">${escapar(definicion.nombre)}: ${escapar(valores.titulo)}</h2>
      <p style="margin:0 0 16px">De <b>${escapar(autor.nombre)}</b> (${escapar(autor.email)}).
        Respondé este mail para contestarle.</p>
      <table style="border-collapse:collapse;font-size:14px">${filas}</table>
      <p style="color:#5b6b78;font-size:12px;margin-top:24px">
        También quedó guardada en Supabase, tabla <code>envios</code>.</p>
    </div>`;

  try {
    const respuesta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        // Sin dominio propio, Resend obliga a mandar desde su dirección de prueba.
        from: `${site.nombre} <onboarding@resend.dev>`,
        to: para.split(",").map((m) => m.trim()),
        reply_to: autor.email,
        subject: `Propuesta: ${definicion.nombre.toLowerCase()} — ${valores.titulo}`,
        html,
      }),
    });
    if (!respuesta.ok) {
      console.error("Resend rechazó el mail:", respuesta.status, await respuesta.text());
    }
    return respuesta.ok;
  } catch (error) {
    console.error("No se pudo conectar con Resend:", error);
    return false;
  }
}
