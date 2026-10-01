import Image from "next/image";

/**
 * Foto de perfil que viene de Google, recortada en cuadrado y pasada por el
 * borde blanco y un halo cian.
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
      className={`shrink-0 rounded-full border-2 border-white object-cover shadow-[0_0_14px_#7ff4ff99] ${className}`}
    />
  );
}
