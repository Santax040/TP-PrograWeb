/**
 * Titular de página, en la letra del flyer: minúscula, fina y grande, con
 * una volanta en versalita ancha encima y una línea de brillo debajo.
 *
 * @param {Object} props
 * @param {string} props.texto
 * @param {string} [props.volanta] - Línea chica encima, en letra ancha.
 * @param {string} [props.className]
 */
export default function Titular({ texto, volanta, className = "" }) {
  return (
    <span className={`block ${className}`}>
      {volanta && (
        <span className="mb-4 block font-ancha text-[0.65rem] uppercase tracking-[0.08em] text-cobalto">
          {volanta}
        </span>
      )}
      <span className="titular-apretado block font-titular font-extralight lowercase text-marino">
        {texto}
      </span>
      <span aria-hidden="true" className="linea-brillo mt-6 block w-20" />
    </span>
  );
}
