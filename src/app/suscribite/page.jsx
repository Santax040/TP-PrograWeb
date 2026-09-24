import Link from "next/link";
import Recorte from "@/components/Recorte";
import { formatearPrecio } from "@/lib/formato";
import { pagosActivos, planes } from "@/lib/site";

export const metadata = {
  title: "Suscribite",
  description: "Planes de suscripción: accedé a las notas exclusivas.",
};

const giros = ["-rotate-2", "rotate-1", "-rotate-1"];

export default function SuscribitePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-5xl sm:text-7xl">
        <Recorte texto="Suscribite" />
      </h1>
      <p className="mt-4 max-w-xl -rotate-1 font-marcador text-xl text-acido">
        bancá la revista y leé todo lo que no se publica abierto.
      </p>

      {!pagosActivos && (
        <div className="cinta mt-12 max-w-2xl rotate-1">
          <div className="papel roto border-l-8 border-sangre p-5 pb-7 shadow-[6px_6px_0_rgba(0,0,0,0.6)]">
            <p className="font-titular text-xl uppercase">Todavía no se puede pagar</p>
            <p className="mt-2 leading-snug">
              Los pagos están en camino. Mientras tanto,{" "}
              <span className="marcado">las notas exclusivas se leen gratis</span>. Aprovechá.
            </p>
          </div>
        </div>
      )}

      <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
        {planes.map((plan, i) => (
          <article
            key={plan.slug}
            className={`cinta transition-transform duration-200 hover:rotate-0 ${giros[i % giros.length]}`}
          >
            <div
              className={`papel roto relative flex h-full flex-col p-6 pb-9 ${
                plan.destacado
                  ? "shadow-[8px_8px_0_var(--sangre)]"
                  : "shadow-[6px_6px_0_rgba(0,0,0,0.6)]"
              }`}
            >
              {plan.destacado && (
                <span className="sello absolute -right-2 -top-3 bg-papel text-sm">Conviene</span>
              )}

              <h2 className="font-titular text-4xl uppercase leading-none">{plan.nombre}</h2>
              <p className="mt-2 text-sm text-tinta/75">{plan.bajada}</p>

              <p className="mt-6 border-y-2 border-dashed border-tinta/40 py-4">
                {plan.precio === 0 ? (
                  <span className="font-titular text-5xl">Gratis</span>
                ) : (
                  <>
                    <span className="font-titular text-5xl">{formatearPrecio(plan.precio)}</span>
                    <span className="ml-1 text-sm uppercase tracking-wider text-gris">
                      / {plan.periodo}
                    </span>
                  </>
                )}
              </p>

              <ul className="mt-6 flex flex-1 flex-col gap-2">
                {plan.beneficios.map((b) => (
                  <li key={b} className="flex gap-2 leading-snug">
                    <span aria-hidden="true" className="font-titular text-sangre">
                      ✶
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {plan.precio === 0 ? (
                  <Link
                    href="/notas"
                    className="block bg-tinta px-4 py-3 text-center font-titular uppercase tracking-wide text-papel transition-colors hover:bg-sangre"
                  >
                    Empezar a leer
                  </Link>
                ) : (
                  <p className="border-2 border-dashed border-tinta/50 px-4 py-3 text-center font-titular uppercase tracking-wide text-tinta/60">
                    Próximamente
                  </p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-16 max-w-xl text-sm text-papel/60">
        Precios ficticios. Este sitio es un trabajo práctico y no procesa pagos.
      </p>
    </div>
  );
}
