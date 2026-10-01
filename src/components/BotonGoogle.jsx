"use client";

import { useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/navegador";

/**
 * Entrar con Google (OAuth).
 *
 * El recorrido: este botón manda al usuario a Google → Google le pregunta si
 * le da permiso a la revista → Google lo devuelve a Supabase → Supabase lo
 * manda a `/auth/confirmar` con un código → ahí se canjea por la sesión.
 *
 * Si es la primera vez, Supabase crea el usuario y el trigger de la base le
 * arma el perfil con el nombre y la foto de Google. No hay registro aparte.
 */
export default function BotonGoogle({ siguiente = "/" }) {
  const [yendo, setYendo] = useState(false);
  const [error, setError] = useState(null);

  async function entrar() {
    setYendo(true);
    setError(null);

    const vuelta = new URL("/auth/confirmar", window.location.origin);
    vuelta.searchParams.set("siguiente", siguiente);

    const { error } = await crearClienteNavegador().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: vuelta.toString() },
    });

    // Si salió bien, el navegador ya se está yendo a Google.
    if (error) {
      setError("No pudimos conectar con Google. Probá de nuevo.");
      setYendo(false);
    }
  }

  return (
    <div className="tarjeta flex flex-col items-start gap-5 p-7">
      <p className="leading-relaxed text-humo">
        Entrás con tu cuenta de Google. Si es la primera vez, te creamos el perfil con tu
        nombre y tu foto.
      </p>

      <button
        type="button"
        onClick={entrar}
        disabled={yendo}
        className="inline-flex items-center gap-3 rounded-full border border-white bg-white px-6 py-3 font-titular text-base lowercase text-marino shadow-[0_8px_24px_-12px_#1f45d6] transition-shadow hover:shadow-[0_0_0_1px_#7ff4ff,0_0_24px_#7ff4ffb3] disabled:opacity-60"
      >
        <LogoGoogle />
        {yendo ? "Yendo a Google…" : "Entrar con Google"}
      </button>

      {error && (
        <p role="alert" className="rounded-lg border-l-2 border-cobalto bg-white/70 px-3 py-2 text-sm text-marino">
          {error}
        </p>
      )}
    </div>
  );
}

function LogoGoogle() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.1C12.4 13.7 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.8c4.3-4 6.9-9.9 6.9-17.2z" />
      <path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.6 10.7l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.2-13.5-10l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
    </svg>
  );
}
