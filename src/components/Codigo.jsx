import { getArticulos, getEventos } from "@/lib/data";

/**
 * Las columnas de código del costado izquierdo, como en la imagen de
 * referencia. No es texto inventado: son los slugs y las fechas de las notas
 * y los eventos, escritos de corrido en vertical.
 *
 * Es decoración: se oculta a los lectores de pantalla, y en pantallas de
 * menos de 1280px, donde se montaría sobre el contenido.
 */
export default async function Codigo() {
  const [eventos, articulos] = await Promise.all([getEventos(), getArticulos()]);
  const fuente = [
    ...eventos.map((e) => `${e.fecha.replaceAll("-", "")}${e.slug}`),
    ...articulos.map((a) => `${a.slug}${a.minutosLectura}min`),
  ].join("");

  const columnas = Array.from({ length: 5 }, (_, i) => {
    const desde = (i * 97) % Math.max(fuente.length, 1);
    return (fuente.slice(desde) + fuente).slice(0, 160);
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 left-0 z-0 hidden select-none gap-1 overflow-hidden pl-1 text-[10px] leading-[1.05] text-white/45 xl:flex"
    >
      {columnas.map((texto, i) => (
        <span key={i} className="break-all [writing-mode:vertical-rl]">
          {texto}
        </span>
      ))}
    </div>
  );
}
