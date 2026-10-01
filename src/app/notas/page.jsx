import ArticuloCard from "@/components/ArticuloCard";
import Titular from "@/components/Titular";
import { getArticulos } from "@/lib/data";

// Vuelve a consultar la base como mucho una vez por minuto.
export const revalidate = 60;

export const metadata = {
  title: "Notas",
  description: "Todas las notas publicadas.",
};

export default async function NotasPage() {
  const articulos = await getArticulos();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <header className="mb-16">
        <h1 className="text-4xl sm:text-6xl">
          <Titular texto="Notas" volanta="Archivo completo" />
        </h1>
        <p className="mt-6 text-base leading-relaxed text-acero">
          {articulos.length} publicadas, de la más nueva a la más vieja.
        </p>
      </header>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {articulos.map((a) => (
          <ArticuloCard key={a.slug} articulo={a} />
        ))}
      </div>
    </div>
  );
}
