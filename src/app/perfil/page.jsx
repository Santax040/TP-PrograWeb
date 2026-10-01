import Link from "next/link";
import { redirect } from "next/navigation";
import Avatar from "@/components/Avatar";
import Recorte from "@/components/Recorte";
import { formatearFecha } from "@/lib/formato";
import { planes } from "@/lib/site";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export const metadata = {
  title: "Perfil",
  description: "Los datos de tu cuenta.",
};

/**
 * Ficha de la cuenta. Es una página de servidor: lee la sesión de las
 * cookies, así que nunca se muestra en caché ni con los datos de otro.
 *
 * El rol y el plan se muestran pero no se editan: la base de datos solo
 * deja que el usuario cambie su nombre (ver `grant update (nombre)` en la
 * migración del esquema).
 */
export default async function PerfilPage() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?siguiente=/perfil");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("nombre, rol, plan, suscripcion_hasta, creado_en, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const plan = planes.find((p) => p.slug === perfil?.plan);

  const datos = [
    { etiqueta: "Nombre", valor: perfil?.nombre ?? "—" },
    { etiqueta: "Mail", valor: user.email },
    { etiqueta: "Plan", valor: plan?.nombre ?? perfil?.plan ?? "—" },
    {
      etiqueta: "Suscripción hasta",
      valor: perfil?.suscripcion_hasta ? formatearFecha(perfil.suscripcion_hasta) : "—",
    },
    {
      etiqueta: "Cuenta creada",
      valor: perfil?.creado_en ? formatearFecha(perfil.creado_en.slice(0, 10)) : "—",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-5xl sm:text-6xl">
        <Recorte texto="Perfil" />
      </h1>
      <p className="mt-4 -rotate-1 font-marcador text-xl text-acido">
        quién sos acá adentro.
      </p>

      {(perfil?.avatar_url || perfil?.rol === "admin") && (
        <div className="mt-8 flex items-center gap-4">
          {perfil?.avatar_url && (
            <Avatar url={perfil.avatar_url} tamano={72} className="-rotate-2 shadow-[4px_4px_0_var(--sangre)]" />
          )}
          {perfil?.rol === "admin" && <span className="sello bg-papel">Admin</span>}
        </div>
      )}

      <dl className="cinta papel roto mt-12 rotate-1 divide-y-2 divide-tinta/15 p-6 pb-10 shadow-[6px_6px_0_rgba(0,0,0,0.6)]">
        {datos.map((d) => (
          <div key={d.etiqueta} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
            <dt className="font-titular text-sm uppercase tracking-wide text-tinta/80">
              {d.etiqueta}
            </dt>
            <dd className="font-bold text-tinta">{d.valor}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          href="/configuracion"
          className="inline-block -rotate-1 bg-sangre px-5 py-2 font-titular text-lg uppercase tracking-wide text-papel shadow-[4px_4px_0_var(--tinta)] transition-transform hover:rotate-0"
        >
          Editar datos
        </Link>
        <Link
          href="/suscribite"
          className="font-bold text-acido underline decoration-sangre decoration-2 underline-offset-4"
        >
          Ver los planes
        </Link>
      </div>
    </div>
  );
}
