import type { Metadata } from "next";
import EventoCard from "@/components/EventoCard";
import { getEventos } from "@/lib/data";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Fiestas y recitales confirmados.",
};

export default async function AgendaPage() {
  const eventos = await getEventos();

  // Agrupa por mes para que la lista se lea como una agenda de verdad.
  const porMes = new Map<string, typeof eventos>();
  for (const evento of eventos) {
    const mes = new Date(`${evento.fecha}T00:00:00Z`).toLocaleDateString(
      "es-AR",
      { month: "long", year: "numeric", timeZone: "UTC" },
    );
    porMes.set(mes, [...(porMes.get(mes) ?? []), evento]);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-4xl font-black tracking-tight">Agenda</h1>
      <p className="mb-10 text-muted">
        {eventos.length} fechas confirmadas.
      </p>

      <div className="flex flex-col gap-10">
        {[...porMes.entries()].map(([mes, delMes]) => (
          <section key={mes}>
            <h2 className="mb-4 text-sm uppercase tracking-wider text-accent">
              {mes}
            </h2>
            <div className="flex flex-col gap-3">
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
