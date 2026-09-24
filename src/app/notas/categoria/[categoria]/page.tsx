import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticuloCard from "@/components/ArticuloCard";
import { getArticulosPorCategoria } from "@/lib/data";
import { categorias } from "@/lib/site";

type Props = { params: Promise<{ categoria: string }> };

export async function generateStaticParams() {
  return categorias.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const encontrada = categorias.find((c) => c.slug === categoria);
  return { title: encontrada?.nombre ?? "Categoría" };
}

export default async function CategoriaPage({ params }: Props) {
  const { categoria } = await params;
  const encontrada = categorias.find((c) => c.slug === categoria);

  if (!encontrada) notFound();

  const articulos = await getArticulosPorCategoria(categoria);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm uppercase tracking-wider text-accent">Categoría</p>
      <h1 className="mb-2 mt-1 text-4xl font-black tracking-tight">
        {encontrada.nombre}
      </h1>
      <p className="mb-10 text-muted">
        {articulos.length === 1
          ? "1 nota publicada"
          : `${articulos.length} notas publicadas`}
      </p>

      {articulos.length === 0 ? (
        <p className="rounded-xl border border-borde bg-surface p-8 text-center text-muted">
          Todavía no hay notas en esta categoría.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articulos.map((a) => (
            <ArticuloCard key={a.slug} articulo={a} />
          ))}
        </div>
      )}
    </div>
  );
}
