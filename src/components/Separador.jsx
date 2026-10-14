/** Línea con un texto en el medio ("o con tu mail") entre dos formas de entrar. */
export default function Separador({ texto = "o con tu mail" }) {
  return (
    <p className="my-8 flex items-center gap-4 text-sm text-humo" aria-hidden="true">
      <span className="h-px flex-1 bg-white" />
      {texto}
      <span className="h-px flex-1 bg-white" />
    </p>
  );
}
