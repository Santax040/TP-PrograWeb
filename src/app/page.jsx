import ArticuloCard from "@/components/ArticuloCard";
import EventoCard from "@/components/EventoCard";
import TituloSeccion from "@/components/TituloSeccion";
import Tocadiscos from "@/components/Tocadiscos";
import { getArticulos, getEventos, getTodosLosArtistas } from "@/lib/data";
import { descubrimientos } from "@/lib/descubrimientos";
import { site } from "@/lib/site";

// Vuelve a consultar la base como mucho una vez por minuto.
export const revalidate = 60;

/**
 * Portada: el nombre grande y, debajo, Descubrimientos: un tocadiscos con la
 * lista de canciones. Es la señal de que esto es una revista de música.
 * Después, las notas, con la más nueva primero y más grande; al final, la
 * agenda.
 *
 * Artificial es una revista: las notas van antes que la agenda. Los eventos se
 * anuncian, no se venden, así que no se muestran precios.
 */
export default async function Home() {
  const [notas, eventos, artistas] = await Promise.all([
    getArticulos(),
    getEventos(),
    getTodosLosArtistas(),
  ]);

  // Las canciones del disco. El nombre y el género del artista salen de la
  // base; si un artista no existe, su canción no se muestra.
  const porSlug = new Map(artistas.map((a) => [a.slug, a]));
  const canciones = descubrimientos
    .filter((c) => porSlug.has(c.artista))
    .map((c) => ({
      slug: c.slug,
      tema: c.tema,
      artista: porSlug.get(c.artista).nombre,
      artistaSlug: c.artista,
      duracion: c.duracion,
      genero: porSlug.get(c.artista).genero,
      portada: c.portada,
    }));

  // Las notas ya vienen de la más nueva a la más vieja: la primera va grande.
  const [masNueva, ...siguientes] = notas;

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-4 py-12">
      <section className="relative mb-28">
        <h1 className="relative z-20 font-ancha text-5xl uppercase leading-none text-white [text-shadow:0_0_30px_#ffffffcc] sm:text-7xl lg:text-8xl">
          {site.nombre}
        </h1>

        <div className="mt-10">
          <Tocadiscos
            canciones={canciones}
            intro={
              <p className="max-w-sm text-lg leading-relaxed text-marino">{site.descripcion}</p>
            }
          />
        </div>

      </section>

      <section className="mb-28">
        <TituloSeccion titulo="Últimas notas" href="/notas" enlace="Todas las notas" />
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {masNueva && (
            <div className="sm:col-span-2 lg:col-span-2">
              <ArticuloCard articulo={masNueva} destacado />
            </div>
          )}
          {siguientes.map((a) => (
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
