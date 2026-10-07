/**
 * Roles de las cuentas (columna `perfiles.rol`). La regla de qué puede cada
 * uno vive en la base (RLS); esto es solo cómo se muestran.
 *
 * - admin: uno solo, puede todo.
 * - publicador: publica notas; edita y borra solo las suyas.
 * - usuario: lee y manda propuestas.
 * - artista: como usuario; a futuro, sube música. Lo elige cada uno desde
 *   Configuración (función `elegir_ser_artista` de la base).
 *
 * Suscriptor no es un rol: es el plan (`perfiles.plan`), y vale para todos.
 */
export const nombresDeRol = {
  admin: "Admin",
  publicador: "Publicador",
  usuario: "Usuario",
  artista: "Artista",
};

/** Un usuario o artista puede pasarse entre esos dos por su cuenta. */
export function puedeElegirArtista(perfil) {
  return perfil?.rol === "usuario" || perfil?.rol === "artista";
}

/** Suscripción paga y vigente (mientras no haya pagos, se activa a mano). */
export function esSuscriptor(perfil) {
  if (!perfil || perfil.plan === "libre" || !perfil.suscripcion_hasta) return false;
  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
  return perfil.suscripcion_hasta >= hoy;
}
