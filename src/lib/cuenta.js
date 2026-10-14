/**
 * Reglas de las cuentas con mail y contraseña, compartidas entre los
 * formularios (navegador) y las Server Actions.
 *
 * Tiene que coincidir con `minimum_password_length` de supabase/config.toml:
 * Supabase rechaza igual las más cortas.
 */
export const LARGO_MINIMO_CLAVE = 8;
