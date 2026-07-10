import type { NextConfig } from "next";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? "demo";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['smokeless-annabelle-overwily.ngrok-free.dev'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: `/${cloudName}/**`,
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
