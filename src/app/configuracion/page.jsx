import Link from "next/link";
import { redirect } from "next/navigation";
import FormularioNombre from "@/components/FormularioNombre";
import Recorte from "@/components/Recorte";
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
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-5xl sm:text-6xl">
        <Recorte texto="Config" />
      </h1>
      <p className="mt-4 -rotate-1 font-marcador text-xl text-acido">
        cómo te ven los demás.
      </p>

      <div className="cinta mt-12 rotate-1">
        <FormularioNombre nombreActual={perfil?.nombre ?? ""} />
      </div>

      <p className="mt-10 text-sm text-papel/70">
        El mail y la contraseña todavía no se cambian desde acá.
      </p>

      <p className="mt-6">
        <Link
          href="/perfil"
          className="font-bold text-acido underline decoration-sangre decoration-2 underline-offset-4"
        >
          Volver al perfil
        </Link>
      </p>
    </div>
  );
}
