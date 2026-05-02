/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.api-sports.io" },
      { protocol: "https", hostname: "a.espncdn.com" },
      { protocol: "https", hostname: "flagcdn.com" },
    ],
  },
};

export default nextConfig;
