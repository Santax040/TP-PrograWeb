import { redirect } from "next/navigation";

/**
 * Con Google no hay registro aparte: entrar por primera vez crea la cuenta.
 * La ruta se mantiene para que los links viejos no den 404.
 */
export default function RegistroPage() {
  redirect("/login");
}
