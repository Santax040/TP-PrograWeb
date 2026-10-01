import BotonGoogle from "@/components/BotonGoogle";
import Recorte from "@/components/Recorte";

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
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-5xl sm:text-6xl">
        <Recorte texto="Entrar" />
      </h1>
      <p className="mt-4 -rotate-1 font-marcador text-xl text-acido">
        los de adentro, por acá.
      </p>

      {avisos[aviso] && (
        <p role="status" className="mt-8 rotate-1 border-2 border-acido px-3 py-2 text-acido">
          {avisos[aviso]}
        </p>
      )}

      <div className="cinta mt-12 rotate-1">
        <BotonGoogle siguiente={siguiente} />
      </div>
    </div>
  );
}
