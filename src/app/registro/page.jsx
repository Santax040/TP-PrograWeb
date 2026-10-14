import Link from "next/link";
import BotonGoogle from "@/components/BotonGoogle";
import FormularioCuenta from "@/components/FormularioCuenta";
import Titular from "@/components/Titular";
import Separador from "@/components/Separador";

export const metadata = {
  title: "Crear cuenta",
  description: "Creá tu cuenta en la revista con Google o con tu mail.",
};

/**
 * Crear cuenta: con Google (la primera vez que se entra se crea sola) o con
 * nombre, mail y contraseña. En los dos casos queda como cuenta de usuario.
 */
export default async function RegistroPage({ searchParams }) {
  const { siguiente } = await searchParams;
  const conSiguiente = siguiente ? `?siguiente=${encodeURIComponent(siguiente)}` : "";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl">
          <Titular texto="Crear cuenta" volanta="Es gratis" />
        </h1>
      </header>

      <BotonGoogle siguiente={siguiente} />

      <Separador />

      <FormularioCuenta modo="crear" siguiente={siguiente} />

      <p className="mt-10 text-sm text-marino">
        ¿Ya tenés cuenta?{" "}
        <Link href={`/login${conSiguiente}`} className="font-semibold text-cobalto underline underline-offset-4">
          Entrá
        </Link>
      </p>
    </div>
  );
}
