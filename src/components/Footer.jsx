import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-32 border-t border-hormigon">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-titular text-2xl font-bold uppercase tracking-[0.18em] text-pizarra">
            {site.nombre}
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-acero">
            Trabajo práctico de Programación Web. Todo el contenido, los
            artistas y los lugares son ficticios.
          </p>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-acero">
          Buenos Aires · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
