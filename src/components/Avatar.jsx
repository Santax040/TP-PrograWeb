import Image from "next/image";

/**
 * Foto de perfil que viene de Google, recortada en cuadrado y con el filtro
 * de fotocopia del resto del sitio.
 *
 * Usa `next/image`: Next la baja de Google, la achica y la sirve desde
 * nuestro dominio. El dominio de Google está habilitado en `next.config.mjs`.
 */
export default function Avatar({ url, tamano = 40, className = "" }) {
  return (
    <Image
      src={url}
      alt=""
      width={tamano}
      height={tamano}
      className={`shrink-0 border-2 border-tinta object-cover grayscale contrast-125 ${className}`}
    />
  );
}
