import ListaConVenta from "@/components/ListaConVenta";
import Titular from "@/components/Titular";
import { getTodasLasCanciones } from "@/lib/musica";

// Vuelve a consultar la base como mucho una vez por minuto.
export const revalidate = 60;

export const metadata = {
  title: "Música",
  description: "Todos los temas que subieron los artistas de la revista.",
};

/**
 * Sección Música: todos los temas, del más nuevo al más viejo. El tocadiscos
 * de la portada muestra solo los últimos 10; acá están todos.
 */
export default async function MusicaPage() {
  const canciones = await getTodasLasCanciones();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <header className="mb-16">
        <h1 className="text-5xl sm:text-7xl">
          <Titular texto="Música" volanta="Los temas de los artistas" />
        </h1>
        <p className="mt-6 text-base leading-relaxed text-humo">
          {canciones.length === 1 ? "1 tema" : `${canciones.length} temas`}. Tocá uno y sigue con
          el próximo, aunque cambies de página.
        </p>
      </header>

      {canciones.length === 0 ? (
        <p className="tarjeta max-w-md p-8 text-center font-titular font-light leading-relaxed text-humo">
          Todavía no hay temas. Volvé pronto.
        </p>
      ) : (
        <ListaConVenta canciones={canciones} conArtista />
      )}
    </div>
  );
}
