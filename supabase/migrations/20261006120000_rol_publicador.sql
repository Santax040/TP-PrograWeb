-- =============================================================================
-- Rol nuevo: publicador
--
-- Los 3 o 4 redactores oficiales de la revista. Va en su propia migración
-- porque Postgres no deja usar un valor nuevo de un enum en la misma
-- transacción en la que se agrega.
-- =============================================================================

alter type public.rol_usuario add value 'publicador' before 'admin';
