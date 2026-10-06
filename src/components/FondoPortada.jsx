import Image from "next/image";

/**
 * Lo que va adentro de un `.bruma` como portada de una nota: la foto subida
 * en Redacción o, si no tiene, su gradiente.
 *
 * Tiene que ser el primer hijo del `.bruma`, que es el que recibe el tinte
 * menta del sitio. La foto está guardada limpia (16:9); el tinte se aplica
 * acá, en pantalla, igual que a los gradientes.
 *
 * @param {Object} props
 * @param {{ portada: string, portadaUrl?: string | null }} props.articulo
 * @param {string} props.sizes - Ancho que ocupa en pantalla, para que Next
 *   sirva una versión del tamaño justo (por ejemplo "(min-width: 768px) 33vw, 100vw").
 * @param {boolean} [props.prioridad] - Para la foto principal de la página.
 */
export default function FondoPortada({ articulo, sizes, prioridad = false }) {
  if (articulo.portadaUrl) {
    return (
      <Image
        src={articulo.portadaUrl}
        alt=""
        fill
        sizes={sizes}
        priority={prioridad}
        className="object-cover"
      />
    );
  }
  return <div className={`h-full w-full bg-gradient-to-br ${articulo.portada}`} />;
}
