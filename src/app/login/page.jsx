import BotonGoogle from "@/components/BotonGoogle";
import Titular from "@/components/Titular";

export const metadata = {
  title: "Entrar",
  description: "Entrá a la revista con tu cuenta de Google.",
};

const avisos = {
  cancelado: "Cancelaste el ingreso con Google. Cuando quieras, probá de nuevo.",
  "link-invalido": "No se pudo completar el ingreso. Probá de nuevo.",
};

/**
 * Única puerta de entrada: no hay registro aparte. La primera vez que alguien
 * entra con Google, se le crea la cuenta y el perfil.
 */
export default async function LoginPage({ searchParams }) {
  const { aviso, siguiente } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl">
          <Titular texto="Entrar" volanta="Tu cuenta" />
        </h1>
      </header>

      {avisos[aviso] && (
        <p role="status" className="mb-8 border-l-2 border-agua bg-vidrio px-4 py-3 text-sm text-pizarra">
          {avisos[aviso]}
        </p>
      )}

      <BotonGoogle siguiente={siguiente} />
    </div>
  );
}
