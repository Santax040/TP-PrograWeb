import { Albert_Sans, Audiowide, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Marquesina from "@/components/Marquesina";
import Codigo from "@/components/Codigo";
import { site } from "@/lib/site";

/*
 * Tres tipografías, cada una con un rol:
 * - Audiowide: la letra techno ancha de "GEN X", en mayúscula y a veces en
 *   contorno.
 * - Share Tech Mono: los datos de la pantalla, las columnas de código y los
 *   rótulos del HUD.
 * - Albert Sans: texto corrido y títulos de notas.
 */
const audiowide = Audiowide({
  variable: "--fuente-ancha",
  weight: "400",
  subsets: ["latin"],
});

const shareTech = Share_Tech_Mono({
  variable: "--fuente-mono",
  weight: "400",
  subsets: ["latin"],
});

const albert = Albert_Sans({
  variable: "--fuente-texto",
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

/**
 * Metadatos base. El `template` hace que cada página agregue su propio
 * título antes del nombre del sitio, sin repetirlo a mano en cada archivo.
 */
export const metadata = {
  title: {
    default: `${site.nombre} — ${site.tagline}`,
    template: `%s — ${site.nombre}`,
  },
  description: site.descripcion,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${audiowide.variable} ${shareTech.variable} ${albert.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Codigo />
        <Header />
        <Marquesina />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
