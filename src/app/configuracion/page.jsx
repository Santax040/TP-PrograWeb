import Link from "next/link";
import { redirect } from "next/navigation";
import FormularioArtista from "@/components/FormularioArtista";
import FormularioNombre from "@/components/FormularioNombre";
import Titular from "@/components/Titular";
import { puedeElegirArtista } from "@/lib/roles";
import { obtenerSesion } from "@/lib/sesion";

export const metadata = {
  title: "Configuración",
  description: "Cambiá los datos de tu cuenta.",
};

/**
 * Lo que cada uno puede cambiar de su cuenta: el nombre y, si es usuario o
 * artista, el tipo de cuenta. El resto del perfil (rol de publicador o admin,
 * plan) no lo puede tocar el usuario: lo protege la base. El mail y la foto
 * vienen de Google.
 */
export default async function ConfiguracionPage() {
  const { user, perfil } = await obtenerSesion();
  if (!user) redirect("/login?siguiente=/configuracion");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl">
          <Titular texto="Configuración" volanta="Tu cuenta" />
        </h1>
      </header>

      <FormularioNombre nombreActual={perfil?.nombre ?? ""} />

      {/* Publicadores y el admin no lo ven: pasarse a artista les sacaría
          sus permisos (y la base tampoco se los deja). */}
      {puedeElegirArtista(perfil) && (
        <div className="mt-8">
          <FormularioArtista esArtista={perfil.rol === "artista"} />
        </div>
      )}

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
