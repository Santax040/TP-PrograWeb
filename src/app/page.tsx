import Link from "next/link";
import ArticuloCard from "@/components/ArticuloCard";
import EventoCard from "@/components/EventoCard";
import { getArticulos, getArticulosDestacados, getEventos } from "@/lib/data";
import { site } from "@/lib/site";

/**
 * Portada de la revista.
 *
 * Es un Server Component: el `await` de los datos ocurre en el servidor y al
 * navegador le llega el HTML ya armado. Por eso no hace falta useEffect ni
 * estados de carga.
 */
export default async function Home() {
  const [destacados, todos, eventos] = await Promise.all([
    getArticulosDestacados(),
    getArticulos(),
    getEventos(),
  ]);

  const principal = destacados[0];
  const secundarios = destacados.slice(1);
  const restantes = todos.filter((a) => !a.destacado);
  const proximos = eventos.slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-12 border-b border-borde pb-10">
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
          {site.tagline}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">{site.descripcion}</p>
      </section>

      <section className="mb-16 grid gap-6 lg:grid-cols-3">
        {principal && (
          <div className="lg:col-span-2">
            <ArticuloCard articulo={principal} destacado />
          </div>
        )}
        <div className="flex flex-col gap-6">
          {secundarios.map((a) => (
            <ArticuloCard key={a.slug} articulo={a} />
          ))}
        </div>
      </section>

      <section className="mb-16">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold">Lo que se viene</h2>
          <Link href="/agenda" className="text-sm text-accent hover:opacity-80">
            Ver la agenda completa →
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {proximos.map((e) => (
            <EventoCard key={e.slug} evento={e} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold">Últimas notas</h2>
          <Link href="/notas" className="text-sm text-accent hover:opacity-80">
            Ver todas →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restantes.map((a) => (
            <ArticuloCard key={a.slug} articulo={a} />
          ))}
        </div>
      </section>
    </div>
  );
}
