import NotasFiltrables from "@/components/NotasFiltrables";
import Titular from "@/components/Titular";
import { getArticulos, getTodosLosArtistas } from "@/lib/data";

// Vuelve a consultar la base como mucho una vez por minuto.
export const revalidate = 60;

export const metadata = {
  title: "Notas",
  description: "Todas las notas publicadas.",
};

export default async function NotasPage() {
  const [articulos, artistas] = await Promise.all([getArticulos(), getTodosLosArtistas()]);

  // A la lista del navegador va solo lo que muestra la tarjeta (sin el cuerpo
  // de la nota), con los nombres de los artistas para el filtro: los que
  // tienen ficha y los escritos a mano.
  const nombreDe = new Map(artistas.map((a) => [a.slug, a.nombre]));
  const notas = articulos.map(({ cuerpo: _cuerpo, ...a }) => ({
    ...a,
    nombresArtistas: [
      ...a.artistas.map((s) => nombreDe.get(s)).filter(Boolean),
      ...a.artistasMencionados,
    ],
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <header className="mb-16">
        <h1 className="text-5xl sm:text-7xl">
          <Titular texto="Notas" volanta="Archivo completo" />
        </h1>
        <p className="mt-6 text-base leading-relaxed text-humo">
          {articulos.length} publicadas. Se pueden ordenar y filtrar por autor o por artista.
        </p>
      </header>

      <NotasFiltrables notas={notas} />
    </div>
  );
}
