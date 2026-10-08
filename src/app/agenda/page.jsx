import AgendaFiltrable from "@/components/AgendaFiltrable";
import Titular from "@/components/Titular";
import { getEventos, getTodosLosArtistas } from "@/lib/data";

// Vuelve a consultar la base como mucho una vez por minuto.
export const revalidate = 60;

export const metadata = {
  title: "Agenda",
  description: "Fiestas y recitales confirmados.",
};

export default async function AgendaPage() {
  const [eventos, artistas] = await Promise.all([getEventos(), getTodosLosArtistas()]);

  // Los nombres del line-up, para poder filtrar por artista.
  const nombreDe = new Map(artistas.map((a) => [a.slug, a.nombre]));
  const conNombres = eventos.map((e) => ({
    ...e,
    nombresLineup: e.lineup.map((s) => nombreDe.get(s)).filter(Boolean),
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <header className="mb-16">
        <h1 className="text-5xl sm:text-7xl">
          <Titular texto="Agenda" volanta="Próximas fechas" />
        </h1>
        <p className="mt-6 text-base leading-relaxed text-humo">
          {eventos.length} fechas confirmadas.
        </p>
      </header>

      <AgendaFiltrable eventos={conNombres} />
    </div>
  );
}
