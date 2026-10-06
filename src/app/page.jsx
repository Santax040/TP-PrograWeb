import Link from "next/link";
import FondoPortada from "@/components/FondoPortada";
import ArticuloCard from "@/components/ArticuloCard";
import EventoCard from "@/components/EventoCard";
import TituloSeccion from "@/components/TituloSeccion";
import { getArticulos, getArticulosDestacados, getEventos } from "@/lib/data";
import { site } from "@/lib/site";

// Vuelve a consultar la base como mucho una vez por minuto.
export const revalidate = 60;

/**
 * Portada en collage, como la imagen de referencia. Desde tablet, las piezas
 * se ubican en una grilla de 12 columnas y se superponen a propósito: el
 * título, la foto grande con su marco corrido, la foto chica abajo a la
 * izquierda y el panel azul con la próxima fecha. En celular se apilan.
 *
 * Artificial es una revista: las notas van antes que la agenda. Los eventos se
 * anuncian, no se venden, así que no se muestran precios.
 */
export default async function Home() {
  const [destacados, todos, eventos] = await Promise.all([
    getArticulosDestacados(),
    getArticulos(),
    getEventos(),
  ]);

  const [principal, secundaria, ...otrasDestacadas] = destacados;
  const proximo = eventos[0];
  const restantes = [...otrasDestacadas, ...todos.filter((a) => !a.destacado)];

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-4 py-12">
      <section className="relative mb-28 grid grid-cols-1 gap-6 md:grid-cols-12 md:grid-rows-[repeat(9,3.75rem)] md:gap-0">
        <div className="relative z-20 md:col-span-8 md:col-start-1 md:row-span-3 md:row-start-1">
          <h1 className="font-ancha text-5xl uppercase leading-none text-white [text-shadow:0_0_30px_#ffffffcc] sm:text-7xl lg:text-8xl">
            {site.nombre}
          </h1>
        </div>

        {principal && (
          <>
            <Link
              href={`/notas/${principal.slug}`}
              className="group relative z-10 block md:col-span-6 md:col-start-7 md:row-span-6 md:row-start-2"
            >
              <div className="bruma h-64 border border-white md:h-full">
                <FondoPortada articulo={principal} sizes="(min-width: 768px) 50vw, 100vw" prioridad />
              </div>
              <span className="absolute inset-x-0 bottom-0 z-[2] bg-marino/55 p-4 backdrop-blur-sm">
                <span className="etiqueta text-white">Nota principal</span>
                <span className="mt-2 block text-xl font-medium text-white group-hover:underline sm:text-2xl">
                  {principal.titulo}
                </span>
              </span>
            </Link>
            {/* Marco corrido de la foto grande, como los recuadros del HUD. */}
            <span
              aria-hidden="true"
              className="pointer-events-none z-20 hidden border border-white md:col-span-6 md:col-start-6 md:row-span-6 md:row-start-3 md:block"
            />
          </>
        )}

        <p className="relative z-20 max-w-sm text-lg leading-relaxed text-marino md:col-span-5 md:col-start-1 md:row-span-1 md:row-start-4 md:self-center">
          {site.descripcion}
        </p>

        {secundaria && (
          <Link
            href={`/notas/${secundaria.slug}`}
            className="group relative z-20 block md:col-span-4 md:col-start-1 md:row-span-4 md:row-start-6"
          >
            <div className="bruma h-48 border border-white md:h-full">
              <FondoPortada articulo={secundaria} sizes="(min-width: 768px) 33vw, 100vw" />
            </div>
            <span className="absolute inset-x-0 bottom-0 z-[2] p-3 text-base font-medium text-white [text-shadow:0_1px_8px_#11303a] group-hover:underline">
              {secundaria.titulo}
            </span>
          </Link>
        )}

        {proximo && (
          <Link
            href={`/agenda/${proximo.slug}`}
            className="cartel relative z-30 flex flex-col justify-between p-4 transition-colors hover:bg-marino md:col-span-3 md:col-start-10 md:row-span-2 md:row-start-1"
          >
            <span className="rotulo text-xs uppercase text-white/80">
              Próxima fecha {proximo.fecha.replaceAll("-", ".")}
            </span>
            <span className="text-lg font-medium leading-tight">{proximo.nombre}</span>
            <span className="rotulo text-xs uppercase text-white/80">
              {proximo.lugar}, {proximo.ciudad}
            </span>
          </Link>
        )}

        {/* Líneas del HUD que cruzan la composición. */}
        <span
          aria-hidden="true"
          className="linea-brillo pointer-events-none absolute -left-16 right-0 top-[47%] z-0 hidden md:block"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-2rem] left-[34%] top-[30%] z-0 hidden w-px bg-white md:block"
        />
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
