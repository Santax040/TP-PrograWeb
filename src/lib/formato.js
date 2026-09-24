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

export function formatearPrecio(pesos) {
  return pesos.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}
