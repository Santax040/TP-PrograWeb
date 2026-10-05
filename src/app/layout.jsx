import { Audiowide, Exo_2 } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Marquesina from "@/components/Marquesina";
import Codigo from "@/components/Codigo";
import { site } from "@/lib/site";

/*
 * Dos tipografías, nada más:
 * - Audiowide: la letra techno de "ARTIFICIAL". Solo para lo grande: el logo,
 *   los títulos de página y de sección.
 * - Exo 2: todo lo demás. Menú, fechas, etiquetas, títulos de notas y texto.
 *   Tiene las curvas cuadradas de la misma familia que Audiowide, así que
 *   combina sin parecer otra letra.
 */
const audiowide = Audiowide({
  variable: "--fuente-ancha",
  weight: "400",
  subsets: ["latin"],
});

const general = Exo_2({
  variable: "--fuente-texto",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

/**
 * Metadatos base. El `template` hace que cada página agregue su propio
 * título antes del nombre del sitio, sin repetirlo a mano en cada archivo.
 */
export const metadata = {
  title: {
    default: site.nombre,
    template: `%s — ${site.nombre}`,
  },
  description: site.descripcion,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${audiowide.variable} ${general.variable} h-full antialiased`}
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
