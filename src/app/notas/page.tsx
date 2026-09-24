import type { Metadata } from "next";
import ArticuloCard from "@/components/ArticuloCard";
import { getArticulos } from "@/lib/data";

export const metadata: Metadata = {
  title: "Notas",
  description: "Todas las notas publicadas.",
};

export default async function NotasPage() {
  const articulos = await getArticulos();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-4xl font-black tracking-tight">Notas</h1>
      <p className="mb-10 text-muted">
        {articulos.length} publicadas, de la más nueva a la más vieja.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articulos.map((a) => (
          <ArticuloCard key={a.slug} articulo={a} />
        ))}
      </div>
    </div>
  );
}
