/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'chatwoot.nrg.ia.br',
      },
    ],
  },
};

export default nextConfig;
