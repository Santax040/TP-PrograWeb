import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-32 border-t border-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="contorno-oscuro font-ancha text-5xl uppercase sm:text-7xl">{site.nombre}</p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-md">
            <p className="text-marino">
              ¿Tenés una nota, una fecha o un artista?{" "}
              <Link
                href="/colabora"
                className="font-semibold underline decoration-cobalto decoration-1 underline-offset-4 hover:decoration-2"
              >
                Mandánoslo
              </Link>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-humo">
              Trabajo práctico de Programación Web. Todo el contenido, los artistas y los lugares
              son ficticios.
            </p>
          </div>
          <p className="etiqueta text-marino">Buenos Aires {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}
