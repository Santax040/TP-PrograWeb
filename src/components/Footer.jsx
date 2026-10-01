import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden bg-marino text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 h-64 w-2/3 rounded-full bg-cobalto/50 blur-3xl"
      />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="resplandor font-ancha text-2xl font-light lowercase">{site.nombre}</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65">
            Trabajo práctico de Programación Web. Todo el contenido, los
            artistas y los lugares son ficticios.
          </p>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cian">
          Buenos Aires · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
