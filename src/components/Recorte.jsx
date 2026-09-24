/**
 * Texto armado con letras recortadas de revistas, estilo carta de secuestro.
 *
 * Cada letra toma un fondo, una tipografía y un giro distintos. La elección
 * depende solo de la posición de la letra, así el resultado es siempre el
 * mismo en cada carga y no "salta" entre el servidor y el navegador.
 *
 * Los lectores de pantalla leen el texto entero desde un span oculto y
 * no letra por letra.
 */

const fondos = [
  "bg-papel text-tinta",
  "bg-tinta text-papel",
  "bg-acido text-tinta",
  "bg-papel-sucio text-tinta",
  "bg-sangre text-papel",
  "bg-papel text-tinta",
];

const fuentes = ["font-titular", "font-sucio", "font-maquina font-bold", "font-titular"];

const giros = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3", "rotate-1", "-rotate-2"];

const tamanos = ["text-[1em]", "text-[0.86em]", "text-[1.05em]", "text-[0.94em]"];

export default function Recorte({ texto, className = "" }) {
  const palabras = texto.split(" ");
  let indice = 0;

  return (
    <span className={`inline ${className}`}>
      <span className="sr-only">{texto}</span>
      {palabras.map((palabra, p) => (
        <span key={p} aria-hidden="true" className="mr-[0.3em] inline-block whitespace-nowrap">
          {[...palabra].map((letra) => {
            const i = indice++;
            return (
              <span
                key={i}
                className={`mx-[0.02em] my-[0.06em] inline-block px-[0.12em] leading-[1.05] uppercase shadow-[2px_2px_0_rgba(0,0,0,0.5)] ${fondos[(i * 5 + 1) % fondos.length]} ${fuentes[(i * 3) % fuentes.length]} ${giros[(i * 7 + 2) % giros.length]} ${tamanos[(i * 2 + 1) % tamanos.length]}`}
              >
                {letra}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
