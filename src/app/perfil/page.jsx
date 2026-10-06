import Link from "next/link";
import { redirect } from "next/navigation";
import Avatar from "@/components/Avatar";
import Titular from "@/components/Titular";
import { formatearFecha } from "@/lib/formato";
import { planes } from "@/lib/site";
import { obtenerSesion, puedeEscribir } from "@/lib/sesion";

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
  const { user, perfil } = await obtenerSesion();
  if (!user) redirect("/login?siguiente=/perfil");

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

        {(perfil?.avatar_url || puedeEscribir(perfil)) && (
          <div className="mt-10 flex items-center gap-5">
            {perfil?.avatar_url && <Avatar url={perfil.avatar_url} tamano={72} />}
            {perfil?.rol === "admin" && <span className="etiqueta text-lavanda">Admin</span>}
            {perfil?.rol === "publicador" && (
              <span className="etiqueta text-lavanda">Publicador</span>
            )}
          </div>
        )}
      </header>

      <dl className="tarjeta divide-y divide-white/80 px-7">
        {datos.map((d) => (
          <div
            key={d.etiqueta}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4"
          >
            <dt className="rotulo text-xs uppercase text-cobalto">
              {d.etiqueta}
            </dt>
            <dd className="text-marino">{d.valor}</dd>
          </div>
        ))}
      </dl>

      {/* Lo que cada cuenta puede hacer con la revista: los que publican van
          a Redacción; el resto manda propuestas, que le llegan al equipo por
          mail. */}
      {puedeEscribir(perfil) ? (
        <AccesoCuenta
          titulo="Redacción"
          texto="Escribí, editá y publicá notas de la revista."
          href="/redaccion"
          boton="Ir a Redacción"
        />
      ) : (
        <AccesoCuenta
          titulo="¿Escribiste algo?"
          texto="Mandanos tu nota, una fecha o un artista. Le llega al equipo y, si entra, te escribimos."
          href="/colabora"
          boton="Mandar una nota"
        />
      )}

      <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3">
        <Link
          href="/configuracion"
          className="cartel inline-block px-7 py-2.5 font-titular text-sm transition-shadow hover:shadow-[0_0_24px_#7ff4ffb3]"
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

function AccesoCuenta({ titulo, texto, href, boton }) {
  return (
    <section className="cartel mt-10 flex flex-col gap-4 px-7 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-titular text-xl">{titulo}</h2>
        <p className="mt-1 text-sm leading-relaxed text-white/85">{texto}</p>
      </div>
      <Link
        href={href}
        className="shrink-0 self-start border border-white px-6 py-2.5 font-titular text-sm transition-colors hover:bg-white hover:text-cobalto sm:self-auto"
      >
        {boton}
      </Link>
    </section>
  );
}
