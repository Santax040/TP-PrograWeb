import Link from "next/link";
import EditorNota from "@/components/EditorNota";
import Titular from "@/components/Titular";
import { exigirRedaccion } from "@/lib/sesion";

export const metadata = { title: "Nota nueva" };

export default async function NotaNuevaPage() {
  const { supabase, perfil } = await exigirRedaccion("/redaccion/nueva");
  const { data: artistas } = await supabase.from("artistas").select("slug, nombre").order("nombre");

  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <header className="mb-10">
        <Link href="/redaccion" className="etiqueta text-cobalto transition-colors hover:bg-cobalto hover:text-white">
          ← Redacción
        </Link>
        <h1 className="mt-6 text-4xl sm:text-5xl">
          <Titular texto="Nota nueva" />
        </h1>
      </header>

      <EditorNota
        nota={{ firma: perfil.nombre, fecha: hoy, estado: "borrador" }}
        artistas={artistas ?? []}
        esAdmin={perfil.rol === "admin"}
      />
    </div>
  );
}
