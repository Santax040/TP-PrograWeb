import { notFound } from "next/navigation";
import ArticuloCard from "@/components/ArticuloCard";
import Titular from "@/components/Titular";
import { getArticulosPorCategoria } from "@/lib/data";
import { categorias } from "@/lib/site";

// Vuelve a consultar la base como mucho una vez por minuto.
export const revalidate = 60;

export async function generateStaticParams() {
  return categorias.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }) {
  const { categoria } = await params;
  const encontrada = categorias.find((c) => c.slug === categoria);
  return { title: encontrada?.nombre ?? "Categoría" };
}

export default async function CategoriaPage({ params }) {
  const { categoria } = await params;
  const encontrada = categorias.find((c) => c.slug === categoria);

  if (!encontrada) notFound();

  const articulos = await getArticulosPorCategoria(categoria);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <header className="mb-16">
        <h1 className="text-5xl sm:text-7xl">
          <Titular texto={encontrada.nombre} volanta="Categoría" />
        </h1>
        <p className="mt-6 text-base leading-relaxed text-humo">
          {articulos.length === 1 ? "1 nota publicada" : `${articulos.length} notas publicadas`}
        </p>
      </header>

      {articulos.length === 0 ? (
        <p className="tarjeta max-w-md p-8 text-center font-titular font-light lowercase leading-relaxed text-humo">
          Todavía no hay notas acá. Volvé pronto.
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articulos.map((a) => (
            <ArticuloCard key={a.slug} articulo={a} />
          ))}
        </div>
      )}
    </div>
  );
}
