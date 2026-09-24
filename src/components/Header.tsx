import Link from "next/link";
import { categorias, site } from "@/lib/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-borde bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
        <Link href="/" className="text-xl font-black tracking-tight">
          {site.nombre}
        </Link>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {categorias.map((c) => (
            <Link
              key={c.slug}
              href={`/notas/categoria/${c.slug}`}
              className="text-muted transition-colors hover:text-foreground"
            >
              {c.nombre}
            </Link>
          ))}
          <Link
            href="/agenda"
            className="font-medium text-accent transition-opacity hover:opacity-80"
          >
            Agenda
          </Link>
        </nav>
      </div>
    </header>
  );
}
