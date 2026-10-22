/**
 * Dirección que toca el `<audio>`: redirige a un link firmado que vence (ver
 * src/app/api/canciones/[id]/audio/route.js).
 *
 * Va sola en este archivo para que el reproductor, que corre en el
 * navegador, no arrastre el cliente de Supabase de `musica.js`.
 */
export function rutaDeAudio(id) {
  return `/api/canciones/${id}/audio`;
}
