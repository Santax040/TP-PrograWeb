import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-24 border-t-4 border-dashed border-papel/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="corrido font-sucio text-4xl text-papel">{site.nombre}</p>
          <p className="mt-2 max-w-md text-sm text-papel/70">
            Trabajo práctico de Programación Web. Todo el contenido, los
            artistas y los lugares son ficticios.
          </p>
        </div>
        <p className="-rotate-3 font-marcador text-xl text-acido">
          fotocopialo y pasalo.
        </p>
      </div>
    </footer>
  );
}
