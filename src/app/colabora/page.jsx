import Link from "next/link";
import FormularioPropuesta from "@/components/FormularioPropuesta";
import Titular from "@/components/Titular";
import { estadosDeEnvio, tiposDeEnvio } from "@/lib/envios";
import { formatearFecha } from "@/lib/formato";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export const metadata = {
  title: "Colaborá",
  description: "Mandanos una nota, una fecha o un artista para la revista.",
};

/**
 * Propuestas de los lectores. No se publican: le llegan al equipo, que decide
 * qué entra. Hace falta haber entrado con Google para saber a quién responder
 * y para frenar el spam.
 */
export default async function ColaboraPage() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Las propias propuestas, para que el lector vea en qué quedaron.
  const { data: propias } = user
    ? await supabase
        .from("envios")
        .select("id, tipo, titulo, estado, creado_en")
        .order("creado_en", { ascending: false })
        .limit(10)
    : { data: [] };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <header className="mb-10">
        <h1 className="text-4xl sm:text-5xl">
          <Titular texto="Colaborá" volanta="Mandanos lo tuyo" />
        </h1>
        <p className="mt-8 max-w-xl leading-relaxed text-marino">
          ¿Escribiste algo, sabés de una fecha o hay un artista que tendría que estar acá?
          Mandánoslo. No se publica directo: lo lee el equipo y, si entra, te escribimos.
        </p>
      </header>

      {user ? (
        <FormularioPropuesta email={user.email} />
      ) : (
        <div className="tarjeta flex flex-col items-start gap-4 p-7">
          <p className="leading-relaxed text-marino">
            Para mandar una propuesta entrá con tu cuenta de Google. Así sabemos a quién
            responderle.
          </p>
          <Link
            href="/login?siguiente=/colabora"
            className="cartel px-6 py-2.5 font-titular text-sm transition-shadow hover:shadow-[0_0_24px_#7ff4ffb3]"
          >
            Entrar con Google
          </Link>
        </div>
      )}

      {propias?.length > 0 && (
        <section className="mt-16">
          <h2 className="rotulo mb-4 text-sm text-marino">Lo que ya mandaste</h2>
          <ul className="tarjeta divide-y divide-white/80">
            {propias.map((p) => (
              <li
                key={p.id}
                className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6"
              >
                <span className="min-w-0 truncate text-marino" title={p.titulo}>
                  <span className="text-humo">{tiposDeEnvio[p.tipo]?.nombre}: </span>
                  {p.titulo}
                </span>
                <span className="text-sm text-humo">
                  {estadosDeEnvio[p.estado]} · {formatearFecha(p.creado_en.slice(0, 10))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
