import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // The PDF catalogs read product photos and the logo from disk (see
  // src/app/catalog/[file]/route.ts), so those files ship with that function.
  outputFileTracingIncludes: {
    "/catalog/*": ["./public/devices/**/*", "./public/brand/**/*"],
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
      // Brand pages that were split by manufacturer spelling and are now merged
      // in src/lib/brands.ts. Google indexed the old URLs, so they redirect.
      { source: "/brands/ellex-lumibird", destination: "/brands/ellex", permanent: true },
      { source: "/brands/laserex-ellex", destination: "/brands/ellex", permanent: true },
      { source: "/brands/scican-coltene", destination: "/brands/scican", permanent: true },
    ];
  },
};

export default nextConfig;
