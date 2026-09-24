import Link from "next/link";
import { getArticulos, getEventos } from "@/lib/data";
import { formatearFechaCorta } from "@/lib/formato";

/**
 * Cinta de "última hora" debajo del header, armada con las próximas fechas
 * y las notas más nuevas. Se genera desde los datos, no está escrita a mano.
 */
export default async function Marquesina() {
  const [eventos, articulos] = await Promise.all([getEventos(), getArticulos()]);

  const items = [
    ...eventos.slice(0, 3).map((e) => ({
      href: `/agenda/${e.slug}`,
      texto: `${formatearFechaCorta(e.fecha)} — ${e.nombre}`,
    })),
    ...articulos.slice(0, 3).map((a) => ({
      href: `/notas/${a.slug}`,
      texto: a.titulo,
    })),
  ];

  // Dos copias seguidas para que la animación haga un bucle sin corte.
  const renglon = (copia: number) =>
    items.map((item, i) => (
      <Link
        key={`${copia}-${i}`}
        href={item.href}
        tabIndex={copia === 0 ? 0 : -1}
        aria-hidden={copia === 1}
        className="flex shrink-0 items-center gap-4 px-4 hover:underline"
      >
        <span className="text-sangre">✶</span>
        <span className="whitespace-nowrap uppercase">{item.texto}</span>
      </Link>
    ));

  return (
    <div className="overflow-hidden border-y-2 border-tinta bg-acido py-2 font-titular text-sm tracking-wide text-tinta">
      <div className="marquesina">
        <span className="shrink-0 bg-tinta px-3 text-acido">ÚLTIMA HORA</span>
        {renglon(0)}
        <span className="shrink-0 bg-tinta px-3 text-acido" aria-hidden="true">
          ÚLTIMA HORA
        </span>
        {renglon(1)}
      </div>
    </div>
  );
}
