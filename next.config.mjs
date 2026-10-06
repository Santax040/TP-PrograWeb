/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Fotos de perfil de las cuentas de Google.
    remotePatterns: [new URL("https://lh3.googleusercontent.com/**")],
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
