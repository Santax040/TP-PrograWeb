import Link from "next/link";
import { redirect } from "next/navigation";
import BloqueCobros from "@/components/BloqueCobros";
import FormularioDerechos from "@/components/FormularioDerechos";
import FormularioFicha from "@/components/FormularioFicha";
import MisCanciones from "@/components/MisCanciones";
import SubirCancion from "@/components/SubirCancion";
import Titular from "@/components/Titular";
import { TEMAS_POR_ARTISTA } from "@/lib/estudio";
import { formatearDuracion } from "@/lib/formato";
import { obtenerSesion } from "@/lib/sesion";

export const metadata = {
  title: "Mi música",
  description: "Subí tus temas al tocadiscos de la revista.",
};

/**
 * El estudio del artista: su ficha y sus temas.
 *
 * Solo para cuentas artista (y el admin). Un usuario común va a
 * Configuración, donde puede pasarse a artista. Es solo para no mostrar la
 * pantalla a quien no corresponde: lo que protege los datos es la base.
 */
export default async function EstudioPage({ searchParams }) {
  const { mp } = await searchParams;
  const { supabase, user, perfil } = await obtenerSesion();
  if (!user) redirect("/login?siguiente=/estudio");
  if (perfil?.rol !== "artista" && perfil?.rol !== "admin") redirect("/configuracion");
  const aceptoDerechos = perfil.rol === "admin" || Boolean(perfil.derechos_aceptados_en);

  const { data: ficha } = await supabase
    .from("artistas")
    .select("id, slug, nombre, genero, bio, puede_vender")
    .eq("perfil_id", user.id)
    .maybeSingle();

  let canciones = [];
  if (ficha) {
    // Con la sesión del artista: la base le muestra también sus temas ocultos.
    const { data } = await supabase
      .from("canciones")
      .select("id, slug, titulo, genero, duracion_seg, portada, publicada, precio, paga_lo_que_quieras")
      .eq("artista_id", ficha.id)
      .is("retirada_en", null)
      .order("creada_en", { ascending: false });
    const { data: ventas } = await supabase.rpc("mis_ventas");
    const ventasPorTema = new Map((ventas ?? []).map((v) => [v.cancion_id, v]));
    canciones = (data ?? []).map((c) => ({
      id: c.id,
      slug: c.slug,
      tema: c.titulo,
      artista: ficha.nombre,
      artistaSlug: ficha.slug,
      duracion: formatearDuracion(c.duracion_seg),
      duracionSeg: c.duracion_seg,
      genero: c.genero || ficha.genero,
      portada: c.portada,
      publicada: c.publicada,
      precio: c.precio,
      pagaLoQueQuieras: c.paga_lo_que_quieras,
      ventas: Number(ventasPorTema.get(c.id)?.cantidad ?? 0),
      recaudado: Number(ventasPorTema.get(c.id)?.total ?? 0),
    }));
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl">
          <Titular texto="Mi música" volanta="Estudio" />
        </h1>
      </header>

      <div className="flex flex-col gap-10">
        {/* El admin no la necesita (la base lo exime). */}
        {!aceptoDerechos && <FormularioDerechos />}

        {ficha && (
          <section aria-labelledby="mis-temas">
            <h2 id="mis-temas" className="mb-4 rotulo text-sm uppercase text-cobalto">
              Tus temas ({canciones.length} de {TEMAS_POR_ARTISTA})
            </h2>
            <MisCanciones canciones={canciones} conPrecio={aceptoDerechos} puedeCobrar={ficha.puede_vender} />
          </section>
        )}

        {ficha && aceptoDerechos && <BloqueCobros conectado={ficha.puede_vender} resultado={mp} />}

        {ficha && aceptoDerechos && (
          <SubirCancion generoFicha={ficha.genero} lleno={canciones.length >= TEMAS_POR_ARTISTA} />
        )}

        <FormularioFicha ficha={ficha} />
      </div>

      <p className="mt-10">
        <Link href="/perfil" className="etiqueta text-cobalto transition-colors hover:bg-cobalto hover:text-white">
          ← Volver al perfil
        </Link>
      </p>
    </div>
  );
}
