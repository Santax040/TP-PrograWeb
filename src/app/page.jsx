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
      {/* Hero con forma de flyer: panel azul, título blanco que brilla,
          datos en versalita ancha y la descripción alineada a la derecha. */}
      <section className="cartel relative mb-24 overflow-hidden px-6 py-14 sm:px-12 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-cian/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-10 h-72 w-96 rounded-full bg-lavanda/50 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,#ffffff14_0_1px,transparent_1px_4px)]"
        />

        <div className="relative">
          <p className="flex flex-wrap gap-x-10 gap-y-2 font-ancha text-[0.65rem] uppercase text-white/80">
            <span>Revista digital</span>
            <span>Buenos Aires</span>
            <span>{new Date().getFullYear()}</span>
          </p>
          <h1 className="titular-apretado resplandor mt-8 max-w-4xl font-titular text-5xl font-extralight lowercase sm:text-7xl lg:text-8xl">
            {site.tagline}
          </h1>
          <p className="mt-12 ml-auto max-w-sm text-right font-titular text-lg font-light lowercase leading-loose text-white/90 sm:text-xl">
            {site.descripcion}
          </p>
        </div>
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
