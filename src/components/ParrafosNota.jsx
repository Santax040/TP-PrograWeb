/** Los párrafos de una nota, con capitular en el primero. */
export default function ParrafosNota({ parrafos }) {
  return (
    <div className="mt-12 flex flex-col gap-6 text-lg leading-[1.75] text-marino">
      {parrafos.map((parrafo, i) => (
        <p key={i} className={i === 0 ? "capitular" : undefined}>
          {parrafo}
        </p>
      ))}
    </div>
  );
}
