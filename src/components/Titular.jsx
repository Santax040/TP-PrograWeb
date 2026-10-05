/**
 * Titular de página como el "GEN X" de la referencia: letra techno llena de
 * blanco y, debajo, la volanta como rótulo en la fuente general.
 *
 * @param {Object} props
 * @param {string} props.texto
 * @param {string} [props.volanta]
 * @param {string} [props.className]
 */
export default function Titular({ texto, volanta, className = "" }) {
  return (
    <span className={`block ${className}`}>
      <span className="titular-apretado block font-ancha uppercase text-white [text-shadow:0_0_24px_#ffffffb3]">
        {texto}
      </span>
      {volanta && (
        <span className="rotulo mt-4 block text-sm uppercase text-humo sm:text-base">
          {volanta}
        </span>
      )}
    </span>
  );
}
