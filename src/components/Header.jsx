import Link from "next/link";
import MenuUsuario from "@/components/MenuUsuario";
import { categorias, site } from "@/lib/site";

/**
 * Header sin fondo, montado sobre el andén: el nombre en la letra techno
 * llena de blanco y una línea del HUD que lo cruza de lado a lado.
 */
export default function Header() {
  return (
    <header className="relative z-40">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-x-8 gap-y-4 px-4 pb-4 pt-6">
        <Link href="/" className="group">
          <span className="block font-ancha text-2xl text-white [text-shadow:0_0_18px_#ffffffb3]">
            {site.nombre}
          </span>
          <span className="mt-1 block font-mono text-xs uppercase text-marino/70">{site.tagline}</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-marino">
          {categorias.map((c) => (
            <Link
              key={c.slug}
              href={`/notas/categoria/${c.slug}`}
              className="subrayado hover:subrayado-activo"
            >
              {c.nombre}
            </Link>
          ))}
          <Link href="/agenda" className="subrayado hover:subrayado-activo">
            Agenda
          </Link>
          <Link href="/suscribite" className="cartel px-3 py-1 hover:bg-marino">
            Suscribite
          </Link>
          <MenuUsuario />
        </nav>
      </div>
      <span aria-hidden="true" className="linea-brillo block w-full" />
    </header>
  );
}
