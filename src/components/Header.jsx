import Link from "next/link";
import MenuUsuario from "@/components/MenuUsuario";
import { categorias, site } from "@/lib/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-hormigon bg-niebla/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-4 py-5">
        <Link href="/" className="group">
          <span className="titular-apretado block font-titular text-3xl font-bold uppercase tracking-[0.18em] text-pizarra transition-colors group-hover:text-agua sm:text-4xl">
            {site.nombre}
          </span>
          <span className="mt-1.5 block font-mono text-[0.68rem] uppercase tracking-[0.22em] text-acero">
            {site.tagline}
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-3 font-titular text-base uppercase tracking-[0.1em] sm:text-lg">
          {categorias.map((c) => (
            <Link
              key={c.slug}
              href={`/notas/categoria/${c.slug}`}
              className="subrayado inline-block py-0.5 text-pizarra transition-colors hover:subrayado-activo hover:text-agua"
            >
              {c.nombre}
            </Link>
          ))}
          <Link
            href="/agenda"
            className="subrayado inline-block py-0.5 text-pizarra transition-colors hover:subrayado-activo hover:text-agua"
          >
            Agenda
          </Link>
          <Link
            href="/suscribite"
            className="inline-block bg-pizarra px-4 py-1.5 text-sm text-niebla transition-colors hover:bg-agua"
          >
            Suscribite
          </Link>
          <MenuUsuario />
        </nav>
      </div>
    </header>
  );
}
