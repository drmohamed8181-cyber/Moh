import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import SessionProvider from "@/components/auth/SessionProvider";
import { safeDb } from "@/lib/prisma";
import { jsonLdScript } from "@/lib/jsonLd";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const DEFAULT_TITLE = "MP MedPharma – Premium Medical Equipment";
const DEFAULT_DESCRIPTION =
  "MP MedPharma offers premium medical equipment for hospitals, clinics, and home healthcare. Shop diagnostic tools, patient monitors, surgical instruments, and more.";
const DEFAULT_KEYWORDS = "medical equipment, hospital supplies, diagnostic tools, patient monitors, MP MedPharma";

const SETTINGS_KEYS = [
  "seoTitle",
  "seoDescription",
  "seoKeywords",
  "phone",
  "email",
  "logo",
  "facebook",
  "twitter",
  "instagram",
  "linkedin",
  "youtube",
];

async function getSiteSettings() {
  const rows = await safeDb((db) => db.siteSetting.findMany({
    where: { key: { in: SETTINGS_KEYS } },
  })) ?? [];
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, string | undefined>;
}

async function getFallbackOgImage(logo: string | undefined) {
  if (logo) return logo;
  const slide = await safeDb((db) => db.heroSlide.findFirst({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { image: true },
  }));
  return slide?.image;
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const ogImage = await getFallbackOgImage(s.logo);

  const title = s.seoTitle || DEFAULT_TITLE;
  const description = s.seoDescription || DEFAULT_DESCRIPTION;
  const keywords = (s.seoKeywords || DEFAULT_KEYWORDS).split(",").map((k: string) => k.trim()).filter(Boolean);

  return {
    title: {
      default: title,
      template: "%s | MP MedPharma",
    },
    description,
    keywords,
    metadataBase: new URL(
      process.env.NODE_ENV === "production" ? "https://www.mpmedpharma.com" : "http://localhost:3000"
    ),
    openGraph: {
      type: "website",
      siteName: "MP MedPharma",
      title,
      description,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSiteSettings();

  const sameAs = [s.facebook, s.twitter, s.instagram, s.linkedin, s.youtube].filter(Boolean);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": ["MedicalBusiness", "Store"],
    name: "MP MedPharma",
    alternateName: "MPMedPharma",
    url: "https://www.mpmedpharma.com",
    ...(s.logo ? { logo: s.logo } : {}),
    description: DEFAULT_DESCRIPTION,
    ...(s.phone ? { telephone: s.phone } : {}),
    ...(s.email ? { email: s.email } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-screen bg-white antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd) }}
        />
        <SessionProvider>
          {children}
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
