-- =============================================================================
-- Rol nuevo: artista
--
-- Para cuando se pueda subir música: solo los artistas van a poder hacerlo.
-- Por ahora tiene los mismos permisos que un usuario (leer y mandar
-- propuestas). Va en su propia migración porque Postgres no deja usar un
-- valor nuevo de un enum en la misma transacción en la que se agrega.
-- =============================================================================

alter type public.rol_usuario add value 'artista' after 'usuario';
