import Link from "next/link";
import { categorias, site } from "@/lib/site";

const giros = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

export default function Header() {
  return (
    <header className="border-b-4 border-tinta bg-carbon">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-x-8 gap-y-4 px-4 pb-4 pt-6">
        <Link href="/" className="group">
          <span className="corrido block font-sucio text-5xl leading-none text-papel transition-transform group-hover:-rotate-2 sm:text-6xl">
            {site.nombre}
          </span>
          <span className="mt-1 block font-marcador text-sm text-acido">
            {site.tagline.toLowerCase()}
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 font-titular text-sm uppercase tracking-wide">
          {categorias.map((c, i) => (
            <Link
              key={c.slug}
              href={`/notas/categoria/${c.slug}`}
              className={`papel inline-block px-2 py-1 transition-transform hover:rotate-0 hover:bg-acido ${giros[i % giros.length]}`}
            >
              {c.nombre}
            </Link>
          ))}
          <Link
            href="/agenda"
            className="inline-block rotate-2 bg-sangre px-3 py-1 text-papel shadow-[3px_3px_0_var(--papel)] transition-transform hover:rotate-0"
          >
            Agenda
          </Link>
          <Link
            href="/suscribite"
            className="inline-block -rotate-2 bg-acido px-3 py-1 text-tinta shadow-[3px_3px_0_var(--sangre)] transition-transform hover:rotate-0"
          >
            Suscribite
          </Link>
        </nav>
      </div>
    </header>
  );
}
