import Link from "next/link";
import MenuUsuario from "@/components/MenuUsuario";
import { site } from "@/lib/site";

/**
 * Header sin fondo, montado sobre el andén: el nombre en la letra techno
 * llena de blanco y una línea del HUD que lo cruza de lado a lado.
 */
export default function Header() {
  return (
    <header className="relative z-40">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-4 pb-4 pt-6">
        <Link href="/" className="group">
          <span className="block font-ancha text-2xl uppercase text-white [text-shadow:0_0_18px_#ffffffb3]">
            {site.nombre}
          </span>
        </Link>

        {/* Solo cuatro opciones, en mayúscula como los rótulos del HUD. El
            resto de las categorías se alcanza desde las notas. */}
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 rotulo text-sm uppercase text-marino">
          <Link href="/notas/categoria/musica" className="subrayado hover:subrayado-activo">
            Música
          </Link>
          <Link href="/agenda" className="subrayado hover:subrayado-activo">
            Eventos
          </Link>
          <Link href="/suscribite" className="cartel px-3 py-1 hover:bg-marino">
            Suscribete
          </Link>
          <MenuUsuario />
        </nav>
      </div>
      <span aria-hidden="true" className="linea-brillo block w-full" />
    </header>
  );
}
