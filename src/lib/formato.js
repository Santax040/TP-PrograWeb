/**
 * Utilidades de formato compartidas.
 *
 * Se fija la zona horaria a UTC a propósito: las fechas se guardan como
 * "2026-10-03" y sin eso el navegador las interpreta en horario local,
 * haciendo que en Argentina se muestre el día anterior.
 */

export function formatearFecha(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatearFechaCorta(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/** 408 → "6:48". Para la duración de los temas y el tiempo que va sonando. */
export function formatearDuracion(segundos) {
  const total = Math.max(0, Math.floor(segundos || 0));
  const minutos = Math.floor(total / 60);
  return `${minutos}:${String(total % 60).padStart(2, "0")}`;
}

export function formatearPrecio(pesos) {
  return pesos.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}
