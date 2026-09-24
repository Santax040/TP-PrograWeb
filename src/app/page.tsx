import ArticuloCard from "@/components/ArticuloCard";
import EventoCard from "@/components/EventoCard";
import Recorte from "@/components/Recorte";
import TituloSeccion from "@/components/TituloSeccion";
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
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="relative mb-20">
        <h1 className="text-5xl sm:text-7xl lg:text-8xl">
          <Recorte texto={site.tagline} />
        </h1>

        <div className="cinta mt-10 max-w-xl -rotate-1">
          <p className="papel roto p-5 pb-7 text-lg leading-snug shadow-[6px_6px_0_rgba(0,0,0,0.6)]">
            {site.descripcion}
          </p>
        </div>

        <p className="absolute -bottom-6 right-2 hidden rotate-6 font-marcador text-2xl text-acido sm:block">
          sin filtro ↓
        </p>
      </section>

      <section className="mb-24 grid gap-10 lg:grid-cols-3">
        {principal && (
          <div className="lg:col-span-2">
            <ArticuloCard articulo={principal} destacado indice={0} />
          </div>
        )}
        <div className="flex flex-col gap-10">
          {secundarios.map((a, i) => (
            <ArticuloCard key={a.slug} articulo={a} indice={i + 1} />
          ))}
        </div>
      </section>

      <section className="mb-24">
        <TituloSeccion titulo="Lo que se viene" href="/agenda" enlace="la agenda entera" />
        <div className="grid gap-5 md:grid-cols-2">
          {proximos.map((e, i) => (
            <EventoCard key={e.slug} evento={e} indice={i} />
          ))}
        </div>
      </section>

      <section>
        <TituloSeccion titulo="Últimas notas" href="/notas" enlace="todas las notas" />
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {restantes.map((a, i) => (
            <ArticuloCard key={a.slug} articulo={a} indice={i + 2} />
          ))}
        </div>
      </section>
    </div>
  );
}
