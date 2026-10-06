/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Fotos de perfil de las cuentas de Google.
      new URL("https://lh3.googleusercontent.com/**"),
      // Fotos de portada que se suben desde Redacción (Supabase Storage).
      new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portadas/**`),
    ],
  },

  // Secciones que se unieron a Música (2026-10-06): los links viejos no se
  // rompen. Permanente (308), así los buscadores actualizan la dirección.
  async redirects() {
    return [
      {
        source: "/notas/categoria/:vieja(fiestas|quilombo|entrevistas)",
        destination: "/notas/categoria/musica",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
