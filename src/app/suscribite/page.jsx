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
        <h1 className="text-4xl sm:text-6xl">
          <Titular texto="Suscribite" volanta="Planes" />
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-acero">
          Bancá la revista y leé todo lo que no se publica abierto.
        </p>
      </header>

      {!pagosActivos && (
        <div className="mb-16 max-w-2xl border-l-2 border-agua bg-vidrio px-5 py-4">
          <p className="font-titular text-sm uppercase tracking-[0.1em] text-pizarra">
            Todavía no se puede pagar
          </p>
          <p className="mt-2 text-sm leading-relaxed text-acero">
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
              plan.destacado ? "border-agua" : ""
            }`}
          >
            {plan.destacado && (
              <span className="etiqueta absolute right-6 top-6 text-agua">Conviene</span>
            )}

            <h2 className="font-titular text-2xl font-semibold uppercase tracking-[0.06em] text-pizarra">
              {plan.nombre}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-acero">{plan.bajada}</p>

            <p className="mt-8 border-y border-hormigon py-6">
              {plan.precio === 0 ? (
                <span className="font-mono text-4xl text-pizarra">Gratis</span>
              ) : (
                <>
                  <span className="font-mono text-4xl text-pizarra">
                    {formatearPrecio(plan.precio)}
                  </span>
                  <span className="ml-2 font-mono text-xs uppercase tracking-[0.18em] text-acero">
                    / {plan.periodo}
                  </span>
                </>
              )}
            </p>

            <ul className="mt-8 flex flex-1 flex-col gap-3">
              {plan.beneficios.map((b) => (
                <li key={b} className="flex gap-3 text-sm leading-relaxed text-acero">
                  <span aria-hidden="true" className="text-musgo">
                    —
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            <div className="mt-10">
              {plan.precio === 0 ? (
                <Link
                  href="/notas"
                  className="block bg-pizarra px-4 py-3 text-center font-titular text-sm uppercase tracking-[0.1em] text-niebla transition-colors hover:bg-agua"
                >
                  Empezar a leer
                </Link>
              ) : (
                <p className="border border-hormigon px-4 py-3 text-center font-titular text-sm uppercase tracking-[0.1em] text-acero">
                  Próximamente
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      <p className="mt-16 max-w-xl text-sm text-acero">
        Precios ficticios. Este sitio es un trabajo práctico y no procesa pagos.
      </p>
    </div>
  );
}
