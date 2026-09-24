import ArticuloCard from "@/components/ArticuloCard";
import Recorte from "@/components/Recorte";
import { getArticulos } from "@/lib/data";

export const metadata = {
  title: "Notas",
  description: "Todas las notas publicadas.",
};

export default async function NotasPage() {
  const articulos = await getArticulos();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-5xl sm:text-7xl">
        <Recorte texto="Notas" />
      </h1>
      <p className="mb-14 mt-4 -rotate-1 font-marcador text-xl text-acido">
        {articulos.length} publicadas, de la más nueva a la más vieja.
      </p>

      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {articulos.map((a, i) => (
          <ArticuloCard key={a.slug} articulo={a} indice={i} />
        ))}
      </div>
    </div>
  );
}
