import type { CategoriaSlug } from "./site";

export type Articulo = {
  slug: string;
  titulo: string;
  bajada: string;
  cuerpo: string[];
  categoria: CategoriaSlug;
  autor: string;
  fecha: string;
  minutosLectura: number;
  destacado: boolean;
  /** Reservado para cuando se implemente la suscripción. */
  premium: boolean;
  /** Gradiente que hace de portada mientras no haya imágenes reales. */
  portada: string;
  artistas: string[];
};

export type Artista = {
  slug: string;
  nombre: string;
  genero: string;
  bio: string;
};

export type Evento = {
  slug: string;
  nombre: string;
  fecha: string;
  lugar: string;
  ciudad: string;
  genero: string;
  precioDesde: number;
  lineup: string[];
  descripcion: string;
  portada: string;
};
