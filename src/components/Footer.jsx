import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-32 border-t border-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="contorno-oscuro font-ancha text-5xl uppercase sm:text-7xl">{site.nombre}</p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-humo">
            Trabajo práctico de Programación Web. Todo el contenido, los artistas y los lugares
            son ficticios.
          </p>
          <p className="etiqueta text-marino">Buenos Aires {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}
