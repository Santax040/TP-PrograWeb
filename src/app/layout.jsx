import { Archivo, IBM_Plex_Mono, Mulish } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Marquesina from "@/components/Marquesina";
import { site } from "@/lib/site";

/*
 * Tres tipografías, cada una con un rol fijo:
 * - Archivo: titulares y etiquetas, grotesca de señalética.
 * - Mulish: texto corrido, humanista y redonda, de la familia de Frutiger.
 * - IBM Plex Mono: fechas, horarios y datos, como un cartel de salidas.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700"],
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
      className={`${archivo.variable} ${mulish.variable} ${plexMono.variable} h-full antialiased`}
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
