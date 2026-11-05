import Link from "next/link";
import { redirect } from "next/navigation";
import Titular from "@/components/Titular";
import { formatearFecha, formatearPrecio } from "@/lib/formato";
import { obtenerSesion } from "@/lib/sesion";
import { crearClienteAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Mis compras",
  description: "Los temas que compraste, para volver a bajarlos.",
};

/**
 * Los temas de quien está mirando. Sus compras se buscan con su sesión; los
 * temas, con la clave secreta, porque lo comprado se conserva aunque el
 * artista lo oculte o lo borre, y la base ya no se lo muestra.
 */
export default async function ComprasPage() {
  const { supabase, user } = await obtenerSesion();
  if (!user) redirect("/login?siguiente=/compras");

  const { data } = await supabase
    .from("compras")
    .select("id, cancion_id, monto, creada_en")
    .eq("usuario_id", user.id)
    .order("creada_en", { ascending: false });
  const compras = data ?? [];

  const temas = new Map();
  if (compras.length > 0) {
    const { data: filas } = await crearClienteAdmin()
      .from("canciones")
      .select("id, titulo, artistas ( nombre, slug )")
      .in("id", compras.map((c) => c.cancion_id));
    for (const fila of filas ?? []) temas.set(fila.id, fila);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl">
          <Titular texto="Mis compras" volanta="Tus temas" />
        </h1>
      </header>

      {compras.length === 0 ? (
        <p className="text-humo">
          Todavía no tenés temas.{" "}
          <Link href="/musica" className="text-cobalto underline underline-offset-4 hover:text-marino">
            Mirá la sección Música
          </Link>
          .
        </p>
      ) : (
        <ol className="border-t border-white/70">
          {compras.map((compra) => {
            const tema = temas.get(compra.cancion_id);
            return (
              <li key={compra.id} className="flex items-center gap-3 border-b border-white/70 px-2 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium leading-snug text-marino">{tema?.titulo}</p>
                  {tema?.artistas && (
                    <Link
                      href={`/artistas/${tema.artistas.slug}`}
                      className="block truncate text-sm text-cobalto hover:text-marino"
                    >
                      {tema.artistas.nombre}
                    </Link>
                  )}
                  <p className="mt-0.5 flex flex-wrap gap-x-3 rotulo text-xs uppercase text-humo">
                    <span>{formatearFecha(compra.creada_en.slice(0, 10))}</span>
                    <span>{Number(compra.monto) > 0 ? formatearPrecio(Number(compra.monto)) : "Gratis"}</span>
                  </p>
                </div>
                {/* Un <a> y no un Link: es una descarga, no una página. */}
                <a
                  href={`/api/canciones/${compra.cancion_id}/descarga`}
                  className="cartel shrink-0 px-4 py-2 font-titular text-sm transition-shadow hover:shadow-[0_0_24px_#7ff4ffb3]"
                >
                  Descargar
                </a>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
