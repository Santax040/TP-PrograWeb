import EventoCard from "@/components/EventoCard";
import Recorte from "@/components/Recorte";
import { getEventos } from "@/lib/data";

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
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-5xl sm:text-7xl">
        <Recorte texto="Agenda" />
      </h1>
      <p className="mb-14 mt-4 -rotate-1 font-marcador text-xl text-acido">
        {eventos.length} fechas confirmadas. no te quedes afuera.
      </p>

      <div className="flex flex-col gap-14">
        {[...porMes.entries()].map(([mes, delMes]) => (
          <section key={mes}>
            <h2 className="corrido mb-6 font-titular text-4xl uppercase tracking-tight text-papel">
              {mes}
            </h2>
            <div className="flex flex-col gap-5">
              {delMes.map((e, i) => (
                <EventoCard key={e.slug} evento={e} indice={i} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
