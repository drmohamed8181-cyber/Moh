import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import SessionProvider from "@/components/auth/SessionProvider";
import { safeDb } from "@/lib/prisma";

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

export async function generateMetadata(): Promise<Metadata> {
  const rows = await safeDb((db) => db.siteSetting.findMany({
    where: { key: { in: ["seoTitle", "seoDescription", "seoKeywords"] } },
  })) ?? [];
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]));

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
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-screen bg-white antialiased">
        <SessionProvider>
          {children}
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
