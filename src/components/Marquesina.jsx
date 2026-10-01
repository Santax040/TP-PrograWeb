import Link from "next/link";
import { getArticulos, getEventos } from "@/lib/data";
import { formatearFechaCorta } from "@/lib/formato";

/**
 * Cinta de novedades debajo del header, armada con las próximas fechas y las
 * notas más nuevas. Se genera desde los datos, no está escrita a mano.
 *
 * Se lee como el tablero de salidas de un aeropuerto: monoespaciada, en
 * cian que brilla sobre azul noche.
 */
export default async function Marquesina() {
  const [eventos, articulos] = await Promise.all([getEventos(), getArticulos()]);

  const items = [
    ...eventos.slice(0, 3).map((e) => ({
      href: `/agenda/${e.slug}`,
      texto: `${formatearFechaCorta(e.fecha)} · ${e.nombre}`,
    })),
    ...articulos.slice(0, 3).map((a) => ({
      href: `/notas/${a.slug}`,
      texto: a.titulo,
    })),
  ];

  // Dos copias seguidas para que la animación haga un bucle sin corte.
  const renglon = (copia) =>
    items.map((item, i) => (
      <Link
        key={`${copia}-${i}`}
        href={item.href}
        tabIndex={copia === 0 ? 0 : -1}
        aria-hidden={copia === 1}
        className="flex shrink-0 items-center gap-5 px-5 transition-colors hover:text-white"
      >
        <span className="text-lavanda">◆</span>
        <span className="whitespace-nowrap">{item.texto}</span>
      </Link>
    ));

  return (
    <div className="overflow-hidden border-b border-cian/30 bg-marino py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-cian [text-shadow:0_0_10px_#7ff4ff99]">
      <div className="marquesina">
        <span className="shrink-0 pl-4 text-white">Salidas</span>
        {renglon(0)}
        <span className="shrink-0 pl-4 text-white" aria-hidden="true">
          Salidas
        </span>
        {renglon(1)}
      </div>
    </div>
  );
}
