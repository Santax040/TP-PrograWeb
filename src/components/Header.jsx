import Link from "next/link";
import MenuUsuario from "@/components/MenuUsuario";
import { categorias, site } from "@/lib/site";

/**
 * Header con forma de cartel de aeropuerto: banda azul cobalto, letra blanca
 * ancha y una flecha de señalética delante del nombre.
 */
export default function Header() {
  return (
    <header className="relative z-40 sm:sticky sm:top-0 border-b border-white/25 bg-cobalto/90 text-white shadow-[0_10px_30px_-18px_#0b1a3d] backdrop-blur-md">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"
      />
      <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-4 py-4">
        <Link href="/" className="group flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/70 text-2xl leading-none transition-transform group-hover:-translate-y-0.5"
          >
            ↑
          </span>
          <span>
            <span className="block font-ancha text-xl font-light lowercase tracking-tight sm:text-2xl group-hover:resplandor">
              {site.nombre}
            </span>
            <span className="mt-1 block font-mono text-[0.65rem] uppercase tracking-[0.22em] text-white/70">
              {site.tagline}
            </span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-3 font-titular text-base font-light lowercase sm:text-lg">
          {categorias.map((c) => (
            <Link
              key={c.slug}
              href={`/notas/categoria/${c.slug}`}
              className="subrayado inline-block py-0.5 text-white transition-colors hover:subrayado-activo hover:text-cian"
            >
              {c.nombre}
            </Link>
          ))}
          <Link
            href="/agenda"
            className="subrayado inline-block py-0.5 text-white transition-colors hover:subrayado-activo hover:text-cian"
          >
            Agenda
          </Link>
          <Link
            href="/suscribite"
            className="inline-block rounded-full bg-white px-4 py-1.5 text-sm font-normal text-cobalto transition-shadow hover:shadow-[0_0_20px_#7ff4ffcc]"
          >
            Suscribite
          </Link>
          <MenuUsuario />
        </nav>
      </div>
    </header>
  );
}
