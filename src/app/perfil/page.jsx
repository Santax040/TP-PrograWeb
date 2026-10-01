import Link from "next/link";
import { redirect } from "next/navigation";
import Avatar from "@/components/Avatar";
import Titular from "@/components/Titular";
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
    <div className="mx-auto max-w-2xl px-4 py-16">
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl">
          <Titular texto="Perfil" volanta="Tu cuenta" />
        </h1>

        {(perfil?.avatar_url || perfil?.rol === "admin") && (
          <div className="mt-10 flex items-center gap-5">
            {perfil?.avatar_url && <Avatar url={perfil.avatar_url} tamano={72} />}
            {perfil?.rol === "admin" && <span className="etiqueta text-lavanda">Admin</span>}
          </div>
        )}
      </header>

      <dl className="tarjeta divide-y divide-white/80 px-7">
        {datos.map((d) => (
          <div
            key={d.etiqueta}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4"
          >
            <dt className="font-ancha text-[0.55rem] uppercase text-cobalto">
              {d.etiqueta}
            </dt>
            <dd className="text-marino">{d.valor}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3">
        <Link
          href="/configuracion"
          className="cartel inline-block !rounded-full px-7 py-2.5 font-titular text-sm lowercase transition-shadow hover:shadow-[0_0_24px_#7ff4ffb3]"
        >
          Editar datos
        </Link>
        <Link
          href="/suscribite"
          className="etiqueta text-cobalto transition-colors hover:bg-cobalto hover:text-white"
        >
          Ver los planes →
        </Link>
      </div>
    </div>
  );
}
