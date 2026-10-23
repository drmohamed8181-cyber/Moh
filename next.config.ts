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
  // Vercel Functions run on glibc Linux x64, so sharp only needs
  // @img/sharp-linux-x64. The musl and WebAssembly builds npm also installs
  // would add about 28 MB to every function that uses sharp, in every
  // stored deployment.
  outputFileTracingExcludes: {
    "/*": [
      "./node_modules/@img/sharp-libvips-linuxmusl-x64/**/*",
      "./node_modules/@img/sharp-linuxmusl-x64/**/*",
      "./node_modules/@img/sharp-wasm32/**/*",
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
      // Brand pages that were split by manufacturer spelling and are now merged
      // in src/lib/brands.ts. Google indexed the old URLs, so they redirect.
      { source: "/brands/ellex-lumibird", destination: "/brands/ellex", permanent: true },
      { source: "/brands/laserex-ellex", destination: "/brands/ellex", permanent: true },
      { source: "/brands/scican-coltene", destination: "/brands/scican", permanent: true },
    ];
  },
};

export default nextConfig;
