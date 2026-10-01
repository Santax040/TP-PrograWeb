import Link from "next/link";
import FormularioAuth from "@/components/FormularioAuth";
import Recorte from "@/components/Recorte";

export const metadata = {
  title: "Registrate",
  description: "Creá tu cuenta gratis en la revista.",
};

export default function RegistroPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-5xl sm:text-6xl">
        <Recorte texto="Registrate" />
      </h1>
      <p className="mt-4 -rotate-1 font-marcador text-xl text-acido">
        gratis. sin vueltas.
      </p>

      <div className="cinta mt-12 -rotate-1">
        <FormularioAuth modo="registro" />
      </div>

      <p className="mt-10">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-bold text-acido underline decoration-sangre decoration-2 underline-offset-4">
          Entrá
        </Link>
      </p>
    </div>
  );
}
