import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-borde">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-10 text-sm text-muted">
        <p className="font-bold text-foreground">{site.nombre}</p>
        <p>{site.tagline}</p>
        <p className="mt-4 text-xs">
          Trabajo práctico de Programación Web. Todo el contenido, los artistas
          y los lugares son ficticios.
        </p>
      </div>
    </footer>
  );
}
