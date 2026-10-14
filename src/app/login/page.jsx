import Link from "next/link";
import BotonGoogle from "@/components/BotonGoogle";
import FormularioCuenta from "@/components/FormularioCuenta";
import Separador from "@/components/Separador";
import Titular from "@/components/Titular";

export const metadata = {
  title: "Entrar",
  description: "Entrá a la revista con Google o con tu mail.",
};

const avisos = {
  cancelado: "Cancelaste el ingreso con Google. Cuando quieras, probá de nuevo.",
  "link-invalido": "No se pudo completar el ingreso. Probá de nuevo.",
};

/**
 * Dos formas de entrar: con Google o con mail y contraseña. Quien no tiene
 * cuenta la crea en /registro (o entrando con Google por primera vez).
 */
export default async function LoginPage({ searchParams }) {
  const { aviso, siguiente } = await searchParams;
  const conSiguiente = siguiente ? `?siguiente=${encodeURIComponent(siguiente)}` : "";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl">
          <Titular texto="Entrar" volanta="Tu cuenta" />
        </h1>
      </header>

      {avisos[aviso] && (
        <p role="status" className="tarjeta mb-8 border-l-4 !border-l-cobalto px-4 py-3 text-sm text-marino">
          {avisos[aviso]}
        </p>
      )}

      <BotonGoogle siguiente={siguiente} />

      <Separador />

      <FormularioCuenta modo="entrar" siguiente={siguiente} />

      <div className="mt-10 flex flex-col gap-3 text-sm leading-relaxed text-marino">
        <p>
          ¿No tenés cuenta?{" "}
          <Link href={`/registro${conSiguiente}`} className="font-semibold text-cobalto underline underline-offset-4">
            Creá una
          </Link>
        </p>
        <p className="text-humo">
          ¿Te olvidaste la contraseña? Si tu mail es de Google, entrá con el botón de Google:
          es la misma cuenta.
        </p>
      </div>
    </div>
  );
}

