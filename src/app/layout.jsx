import { IBM_Plex_Mono, Lexend, Lexend_Zetta, Mulish } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Marquesina from "@/components/Marquesina";
import { site } from "@/lib/site";

/*
 * Cuatro tipografías, cada una con un rol fijo:
 * - Lexend: titulares, en minúscula y finos, como el título del flyer.
 * - Lexend Zetta: la versión extra ancha, para el logo, la navegación y las
 *   etiquetas chicas en versalita.
 * - Mulish: texto corrido, humanista y redonda, de la familia de Frutiger.
 * - IBM Plex Mono: fechas, horarios y datos, como un cartel de salidas.
 */
const lexend = Lexend({
  variable: "--font-lexend",
  weight: ["200", "300", "400", "500"],
  subsets: ["latin"],
});

const lexendZetta = Lexend_Zetta({
  variable: "--font-lexend-zetta",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
});

const mulish = Mulish({
  variable: "--font-mulish",
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
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
      className={`${lexend.variable} ${lexendZetta.variable} ${mulish.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <Marquesina />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
