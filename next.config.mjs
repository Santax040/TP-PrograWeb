/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Fotos de perfil de las cuentas de Google.
    remotePatterns: [new URL("https://lh3.googleusercontent.com/**")],
  },
};

export default nextConfig;
