import Link from "next/link";
import Titular from "@/components/Titular";
import { formatearFecha } from "@/lib/formato";
import { exigirRedaccion } from "@/lib/sesion";
import { categorias } from "@/lib/site";

export const metadata = {
  title: "Redacción",
  description: "Escribí y publicá notas de la revista.",
};

/**
 * Mesa de Redacción: la lista de notas para editar.
 * El admin ve todas (también los borradores de otros); un publicador, las
 * suyas. Lo decide la consulta, y los permisos de la base lo respaldan.
 */
export default async function RedaccionPage({ searchParams }) {
  const { supabase, user, perfil } = await exigirRedaccion("/redaccion");
  const { borrada } = await searchParams;
  const esAdmin = perfil.rol === "admin";

  let consulta = supabase
    .from("articulos")
    .select("id, slug, titulo, categoria, estado, fecha, firma, destacado, actualizado_en")
    .order("actualizado_en", { ascending: false });
  if (!esAdmin) consulta = consulta.eq("autor_id", user.id);
  const { data: notas } = await consulta;

  // Al admin le avisa si hay propuestas de lectores sin revisar.
  const { count: propuestasNuevas } = esAdmin
    ? await supabase.from("envios").select("id", { count: "exact", head: true }).eq("estado", "nuevo")
    : { count: 0 };

  const borradores = notas?.filter((n) => n.estado === "borrador") ?? [];
  const publicadas = notas?.filter((n) => n.estado === "publicada") ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <header className="mb-12 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-4xl sm:text-5xl">
          <Titular texto="Redacción" volanta={esAdmin ? "Todas las notas" : "Tus notas"} />
        </h1>
        <Link
          href="/redaccion/nueva"
          className="cartel self-start px-7 py-3 font-titular text-base transition-shadow hover:shadow-[0_0_24px_#7ff4ffb3] sm:self-auto"
        >
          Escribir una nota
        </Link>
      </header>

      {borrada && (
        <p role="status" className="mb-8 border-l-2 border-lavanda bg-white/70 px-4 py-3 text-sm text-marino">
          La nota se borró.
        </p>
      )}

      {propuestasNuevas > 0 && (
        <p className="tarjeta mb-10 px-5 py-4 text-marino">
          Hay <span className="font-semibold">{propuestasNuevas}</span>{" "}
          {propuestasNuevas === 1 ? "propuesta nueva" : "propuestas nuevas"} de lectores. Te
          llegaron por mail; también están en Supabase, en la tabla <code>envios</code>.
        </p>
      )}

      {notas?.length === 0 ? (
        <div className="tarjeta flex flex-col items-start gap-4 p-8">
          <p className="text-lg text-marino">Todavía no escribiste ninguna nota.</p>
          <Link href="/redaccion/nueva" className="text-cobalto underline underline-offset-4">
            Empezá la primera
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          <ListaNotas titulo="Borradores" notas={borradores} vacio="No hay borradores." />
          <ListaNotas titulo="Publicadas" notas={publicadas} vacio="Todavía no hay notas publicadas." />
        </div>
      )}
    </div>
  );
}

function ListaNotas({ titulo, notas, vacio }) {
  return (
    <section>
      <h2 className="rotulo mb-4 text-sm text-marino">
        {titulo} <span className="text-humo">({notas.length})</span>
      </h2>
      {notas.length === 0 ? (
        <p className="text-sm text-humo">{vacio}</p>
      ) : (
        <ul className="tarjeta divide-y divide-white/80">
          {notas.map((n) => (
            <li key={n.id}>
              <Link
                href={`/redaccion/${n.id}`}
                className="group grid grid-cols-1 gap-1 px-5 py-4 transition-colors hover:bg-white/50 sm:grid-cols-[minmax(0,1fr)_9rem_9rem] sm:items-baseline sm:gap-6"
              >
                <span className="min-w-0">
                  <span className="block truncate font-titular text-lg text-marino group-hover:text-cobalto">
                    {n.titulo}
                  </span>
                  <span className="text-sm text-humo">
                    {n.firma}
                    {n.destacado && " · destacada en la portada"}
                  </span>
                </span>
                <span className="text-sm text-humo">
                  {categorias.find((c) => c.slug === n.categoria)?.nombre}
                </span>
                <span className="text-sm text-humo">{formatearFecha(n.fecha)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
