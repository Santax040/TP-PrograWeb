/**
 * Titular de página como el "GEN X" de la referencia: letra techno llena de
 * blanco y, debajo, la volanta repetida en contorno, inclinada como
 * "contemporary soft club".
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
        <span className="contorno-oscuro mt-3 block -skew-x-12 font-ancha text-lg uppercase sm:text-2xl">
          {volanta}
        </span>
      )}
    </span>
  );
}
