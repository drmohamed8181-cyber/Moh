import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "mpmedpharma.com" }],
        destination: "https://www.mpmedpharma.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
