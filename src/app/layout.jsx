import { Anton, Courier_Prime, Permanent_Marker, Rubik_Dirt } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Marquesina from "@/components/Marquesina";
import { site } from "@/lib/site";

/*
 * Cuatro tipografías, cada una con un rol fijo:
 * - Anton: titulares, estilo afiche.
 * - Courier Prime: texto corrido, estilo máquina de escribir.
 * - Permanent Marker: anotaciones hechas "a mano".
 * - Rubik Dirt: solo el logo, letra gastada.
 */
const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });

const courier = Courier_Prime({
  variable: "--font-courier",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const marker = Permanent_Marker({
  variable: "--font-marker",
  weight: "400",
  subsets: ["latin"],
});

const dirt = Rubik_Dirt({ variable: "--font-dirt", weight: "400", subsets: ["latin"] });

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
      className={`${anton.variable} ${courier.variable} ${marker.variable} ${dirt.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <Marquesina />
        {/* overflow-x-clip: las hojas giradas no generan scroll horizontal en celular. */}
        <main className="flex-1 overflow-x-clip">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
