import Link from "next/link";
import { redirect } from "next/navigation";
import FormularioNombre from "@/components/FormularioNombre";
import Titular from "@/components/Titular";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export const metadata = {
  title: "Configuración",
  description: "Cambiá los datos de tu cuenta.",
};

/**
 * Por ahora lo único editable es el nombre, porque es lo único que la base
 * deja cambiar al usuario. El mail y la contraseña los maneja Supabase Auth
 * y necesitan confirmación por mail: quedan para más adelante.
 */
export default async function ConfiguracionPage() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?siguiente=/configuracion");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("nombre")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl">
          <Titular texto="Configuración" volanta="Tu cuenta" />
        </h1>
      </header>

      <FormularioNombre nombreActual={perfil?.nombre ?? ""} />

      <p className="mt-10 text-sm leading-relaxed text-humo">
        El mail y la foto los maneja Google: se actualizan solos al volver a entrar.
      </p>

      <p className="mt-8">
        <Link
          href="/perfil"
          className="etiqueta text-cobalto transition-colors hover:bg-cobalto hover:text-white"
        >
          ← Volver al perfil
        </Link>
      </p>
    </div>
  );
}
