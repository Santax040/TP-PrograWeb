/**
 * Titular de página.
 *
 * Reemplaza al viejo `Recorte`, que armaba el texto con letras recortadas de
 * revista. Acá la estética es la contraria: una sola tipografía de
 * señalética, bien grande, apretada y alineada, con una línea fina debajo
 * como la de un cartel de andén.
 *
 * @param {Object} props
 * @param {string} props.texto
 * @param {string} [props.volanta] - Línea chica encima, en monoespaciada.
 * @param {string} [props.className]
 */
export default function Titular({ texto, volanta, className = "" }) {
  return (
    <span className={`block ${className}`}>
      {volanta && (
        <span className="mb-3 block font-mono text-xs uppercase tracking-[0.2em] text-acero">
          {volanta}
        </span>
      )}
      <span className="titular-apretado block font-titular font-semibold text-pizarra">
        {texto}
      </span>
      <span aria-hidden="true" className="mt-5 block h-px w-16 bg-agua" />
    </span>
  );
}
