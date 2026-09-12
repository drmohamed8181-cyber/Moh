import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
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

// Defaults used until the admin sets seoTitle/seoDescription in /admin/seo.
// They name what the business actually sells and the words buyers search for
// ("refurbished", "ophthalmic", the device classes) rather than the generic
// "premium medical equipment" the template shipped with.
const DEFAULT_TITLE = "New & Refurbished Ophthalmic Equipment – Lasers, Phaco, OCT | MP MedPharma";
const DEFAULT_DESCRIPTION =
  "New and certified refurbished ophthalmic equipment from a US supplier: excimer, femtosecond, SLT and YAG lasers, phaco systems, OCT and surgical microscopes from Alcon, Zeiss, Ellex, Lumenis and Iridex. Warranty on every unit.";
const DEFAULT_KEYWORDS =
  "refurbished ophthalmic equipment, used ophthalmic lasers, phaco machine for sale, OCT for sale, excimer laser for sale, SLT YAG laser, ophthalmic equipment supplier USA, MP MedPharma";

// Address shown in the footer/contact defaults, mirrored here so the
// Organization markup carries a location. Search engines treat a business
// with no stated location as a generic web shop; a located one can surface
// for "near me" and "in New Jersey" style queries and in map results.
const DEFAULT_POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  addressRegion: "NJ",
  postalCode: "07675",
  addressCountry: "US",
};

// Emitted only when the corresponding environment variable is set, so a local
// or preview build never claims someone else's Search Console / Bing property.
function siteVerification(): Metadata["verification"] | undefined {
  const google = process.env.GOOGLE_SITE_VERIFICATION;
  const bing = process.env.BING_SITE_VERIFICATION;
  if (!google && !bing) return undefined;
  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { "msvalidate.01": bing } } : {}),
  };
}

const SETTINGS_KEYS = [
  "seoTitle",
  "seoDescription",
  "seoKeywords",
  "phone",
  "email",
  "address",
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
    ...(siteVerification() ? { verification: siteVerification() } : {}),
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
    // A custom admin-entered address is free text, which schema.org accepts;
    // otherwise the structured default that matches the footer.
    address: s.address?.trim() ? s.address.trim() : DEFAULT_POSTAL_ADDRESS,
    areaServed: ["US", "Worldwide"],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

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
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
