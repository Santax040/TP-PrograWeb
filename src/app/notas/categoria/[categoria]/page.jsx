import { notFound } from "next/navigation";
import ArticuloCard from "@/components/ArticuloCard";
import Recorte from "@/components/Recorte";
import { getArticulosPorCategoria } from "@/lib/data";
import { categorias } from "@/lib/site";

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
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="mb-3 inline-block rotate-2 bg-sangre px-2 font-titular text-sm uppercase tracking-widest text-papel">
        Categoría
      </p>
      <h1 className="text-5xl sm:text-7xl">
        <Recorte texto={encontrada.nombre} />
      </h1>
      <p className="mb-14 mt-4 -rotate-1 font-marcador text-xl text-acido">
        {articulos.length === 1 ? "1 nota publicada" : `${articulos.length} notas publicadas`}
      </p>

      {articulos.length === 0 ? (
        <div className="cinta max-w-md rotate-1">
          <p className="papel roto p-8 pb-10 text-center text-lg">
            Todavía no hay notas acá. Volvé pronto.
          </p>
        </div>
      ) : (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {articulos.map((a, i) => (
            <ArticuloCard key={a.slug} articulo={a} indice={i} />
          ))}
        </div>
      )}
    </div>
  );
}
