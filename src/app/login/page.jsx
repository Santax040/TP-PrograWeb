import Link from "next/link";
import FormularioAuth from "@/components/FormularioAuth";
import Recorte from "@/components/Recorte";

export const metadata = {
  title: "Entrar",
  description: "Iniciá sesión en la revista.",
};

const avisos = {
  "link-invalido": "El link del mail no sirve o ya se usó. Probá entrar o registrate de nuevo.",
};

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
        <FormularioAuth modo="login" siguiente={siguiente} />
      </div>

      <p className="mt-10">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="font-bold text-acido underline decoration-sangre decoration-2 underline-offset-4">
          Registrate gratis
        </Link>
      </p>
    </div>
  );
}
