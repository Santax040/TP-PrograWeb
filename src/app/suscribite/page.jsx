import Link from "next/link";
import Titular from "@/components/Titular";
import { formatearPrecio } from "@/lib/formato";
import { pagosActivos, planes } from "@/lib/site";

export const metadata = {
  title: "Suscribite",
  description: "Planes de suscripción: accedé a las notas exclusivas.",
};

export default function SuscribitePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <header className="mb-16">
        <h1 className="text-5xl sm:text-7xl">
          <Titular texto="Suscribite" volanta="Planes" />
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-humo">
          Bancá la revista y leé todo lo que no se publica abierto.
        </p>
      </header>

      {!pagosActivos && (
        <div className="tarjeta mb-16 max-w-2xl border-l-4 !border-l-cobalto px-6 py-5">
          <p className="font-titular text-lg font-light text-marino">
            Todavía no se puede pagar
          </p>
          <p className="mt-2 text-sm leading-relaxed text-humo">
            Los pagos están en camino. Mientras tanto, las notas exclusivas se leen
            gratis.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {planes.map((plan) => (
          <article
            key={plan.slug}
            className={`tarjeta relative flex flex-col p-7 ${
              plan.destacado ? "!border-cobalto ring-1 ring-cian shadow-[0_0_32px_-6px_#7ff4ffb3]" : ""
            }`}
          >
            {plan.destacado && (
              <span className="etiqueta absolute right-6 top-6 text-cobalto">Conviene</span>
            )}

            <h2 className="font-titular text-3xl font-light text-marino">
              {plan.nombre}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-humo">{plan.bajada}</p>

            <p className="mt-8 border-y border-white/80 py-6">
              {plan.precio === 0 ? (
                <span className="font-titular text-4xl font-light text-cobalto">Gratis</span>
              ) : (
                <>
                  <span className="font-titular text-4xl font-light text-cobalto">
                    {formatearPrecio(plan.precio)}
                  </span>
                  <span className="ml-2 font-mono text-xs uppercase tracking-[0.18em] text-humo">
                    / {plan.periodo}
                  </span>
                </>
              )}
            </p>

            <ul className="mt-8 flex flex-1 flex-col gap-3">
              {plan.beneficios.map((b) => (
                <li key={b} className="flex gap-3 text-sm leading-relaxed text-humo">
                  <span aria-hidden="true" className="text-lavanda">
                    ◆
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            <div className="mt-10">
              {plan.precio === 0 ? (
                <Link
                  href="/notas"
                  className="cartel block px-4 py-3 text-center font-titular text-sm transition-shadow hover:shadow-[0_0_24px_#7ff4ffb3]"
                >
                  Empezar a leer
                </Link>
              ) : (
                <p className=" border border-white px-4 py-3 text-center font-titular text-sm text-humo">
                  Próximamente
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      <p className="mt-16 max-w-xl text-sm text-humo">
        Precios ficticios. Este sitio es un trabajo práctico y no procesa pagos.
      </p>
    </div>
  );
}
