import ArticuloCard from "@/components/ArticuloCard";
import EventoCard from "@/components/EventoCard";
import TituloSeccion from "@/components/TituloSeccion";
import { getArticulos, getArticulosDestacados, getEventos } from "@/lib/data";
import { site } from "@/lib/site";

// Vuelve a consultar la base como mucho una vez por minuto.
export const revalidate = 60;

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
    <div className="mx-auto max-w-6xl px-4 py-20">
      <section className="mb-24 max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-acero">
          Revista digital
        </p>
        <h1 className="titular-apretado mt-6 font-titular text-5xl font-semibold text-pizarra sm:text-7xl lg:text-8xl">
          {site.tagline}
        </h1>
        <p className="mt-10 max-w-xl text-lg leading-relaxed text-acero">
          {site.descripcion}
        </p>
        <span aria-hidden="true" className="mt-12 block h-px w-24 bg-agua" />
      </section>

      <section className="mb-28 grid gap-8 lg:grid-cols-3">
        {principal && (
          <div className="lg:col-span-2">
            <ArticuloCard articulo={principal} destacado />
          </div>
        )}
        <div className="flex flex-col gap-8">
          {secundarios.map((a) => (
            <ArticuloCard key={a.slug} articulo={a} />
          ))}
        </div>
      </section>

      <section className="mb-28">
        <TituloSeccion titulo="Lo que se viene" href="/agenda" enlace="La agenda entera" />
        <div className="grid gap-4 md:grid-cols-2">
          {proximos.map((e) => (
            <EventoCard key={e.slug} evento={e} />
          ))}
        </div>
      </section>

      <section>
        <TituloSeccion titulo="Últimas notas" href="/notas" enlace="Todas las notas" />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {restantes.map((a) => (
            <ArticuloCard key={a.slug} articulo={a} />
          ))}
        </div>
      </section>
    </div>
  );
}
