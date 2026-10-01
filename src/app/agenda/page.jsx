import EventoCard from "@/components/EventoCard";
import Titular from "@/components/Titular";
import { getEventos } from "@/lib/data";

// Vuelve a consultar la base como mucho una vez por minuto.
export const revalidate = 60;

export const metadata = {
  title: "Agenda",
  description: "Fiestas y recitales confirmados.",
};

export default async function AgendaPage() {
  const eventos = await getEventos();

  // Agrupa por mes para que la lista se lea como una agenda de verdad.
  const porMes = new Map();
  for (const evento of eventos) {
    const mes = new Date(`${evento.fecha}T00:00:00Z`).toLocaleDateString("es-AR", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    porMes.set(mes, [...(porMes.get(mes) ?? []), evento]);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <header className="mb-16">
        <h1 className="text-4xl sm:text-6xl">
          <Titular texto="Agenda" volanta="Próximas fechas" />
        </h1>
        <p className="mt-6 text-base leading-relaxed text-acero">
          {eventos.length} fechas confirmadas.
        </p>
      </header>

      <div className="flex flex-col gap-16">
        {[...porMes.entries()].map(([mes, delMes]) => (
          <section key={mes}>
            <h2 className="mb-6 border-b border-hormigon pb-3 font-mono text-xs uppercase tracking-[0.22em] text-acero">
              {mes}
            </h2>
            <div className="flex flex-col gap-4">
              {delMes.map((e) => (
                <EventoCard key={e.slug} evento={e} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
