import Link from "next/link";
import ArticuloCard from "@/components/ArticuloCard";
import EventoCard from "@/components/EventoCard";
import TituloSeccion from "@/components/TituloSeccion";
import Tocadiscos from "@/components/Tocadiscos";
import { getArticulos, getArticulosDestacados, getEventos, getTodosLosArtistas } from "@/lib/data";
import { site } from "@/lib/site";

// Vuelve a consultar la base como mucho una vez por minuto.
export const revalidate = 60;

/**
 * Portada: el nombre grande y, debajo, Descubrimientos: un tocadiscos con la
 * lista de lo que suena ahora. El disco ocupa el lugar que tenía la foto de la
 * nota principal y es la señal de que esto es una revista de música.
 *
 * Artificial es una revista: las notas van antes que la agenda. Los eventos se
 * anuncian, no se venden, así que no se muestran precios.
 */
export default async function Home() {
  const [destacados, todos, eventos, artistas] = await Promise.all([
    getArticulosDestacados(),
    getArticulos(),
    getEventos(),
    getTodosLosArtistas(),
  ]);

  // Descubrimientos: las destacadas primero y después las más nuevas, hasta
  // cuatro. Hoy son notas; cuando haya música, cada una va a ser un tema.
  const nombreDe = new Map(artistas.map((a) => [a.slug, a.nombre]));
  const elegidas = [...destacados, ...todos.filter((a) => !a.destacado)].slice(0, 4);
  const descubrimientos = elegidas.map((a) => ({
    slug: a.slug,
    titulo: a.titulo,
    bajada: a.bajada,
    portada: a.portada,
    portadaUrl: a.portadaUrl,
    minutosLectura: a.minutosLectura,
    artistas: [...a.artistas.map((s) => nombreDe.get(s)).filter(Boolean), ...a.artistasMencionados],
  }));

  const proximo = eventos[0];
  const enDisco = new Set(elegidas.map((a) => a.slug));
  const restantes = todos.filter((a) => !enDisco.has(a.slug));

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-4 py-12">
      <section className="relative mb-28">
        <h1 className="relative z-20 font-ancha text-5xl uppercase leading-none text-white [text-shadow:0_0_30px_#ffffffcc] sm:text-7xl lg:text-8xl">
          {site.nombre}
        </h1>

        <div className="mt-10">
          <Tocadiscos
            items={descubrimientos}
            intro={
              <p className="max-w-sm text-lg leading-relaxed text-marino">{site.descripcion}</p>
            }
            esquina={
              proximo && (
                <Link
                  href={`/agenda/${proximo.slug}`}
                  className="cartel flex flex-col gap-1 p-3 transition-colors hover:bg-marino"
                >
                  <span className="rotulo text-xs uppercase text-white/80">
                    Próxima fecha {proximo.fecha.replaceAll("-", ".")}
                  </span>
                  <span className="font-medium leading-tight">{proximo.nombre}</span>
                </Link>
              )
            }
          />
        </div>

      </section>

      <section className="mb-28">
        <TituloSeccion titulo="Últimas notas" href="/notas" enlace="Todas las notas" />
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {restantes.map((a) => (
            <ArticuloCard key={a.slug} articulo={a} />
          ))}
        </div>
      </section>
      <section>
        <TituloSeccion titulo="Lo que se viene" href="/agenda" enlace="La agenda entera" />
        <div className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
          {eventos.slice(0, 6).map((e) => (
            <EventoCard key={e.slug} evento={e} />
          ))}
        </div>
      </section>

    </div>
  );
}
