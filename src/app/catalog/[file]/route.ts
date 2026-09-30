import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { buildCatalogPdf } from "@/lib/catalogPdf";
import { CATALOGS } from "@/lib/catalogs";
import { getCatalogProducts, getSiteSettings } from "@/lib/publicData";
import { SITE_URL } from "@/lib/seo";

// The downloadable equipment catalogs, one per specialty:
//   /catalog/ophthalmology.pdf
//   /catalog/dental.pdf
// Printed QR codes point here, so the PDF is built from the live listings on
// every (CDN-cached) request: a sold unit drops out and a new one appears
// without anything being reprinted. The list of catalogs is src/lib/catalogs.ts.

// Fetching and shrinking a few dozen photos takes a while on a cold start.
export const maxDuration = 60;

const LOGO_PATH = "/brand/mp-logo-full.png";
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const PHOTO_CONCURRENCY = 6;

/**
 * Where to fetch a product photo from: this site's own files or its own
 * Cloudinary account, and nothing else, so the route can't be pointed at an
 * arbitrary host and never embeds a photo hotlinked from someone else's site.
 */
function photoUrl(src: string, origin: string): URL | null {
  if (src.includes("..")) return null;
  if (src.startsWith("/") && !src.startsWith("//") && !src.startsWith("/api/") && !src.startsWith("/_next/")) {
    return new URL(src, origin);
  }
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (cloud && src.startsWith(`https://res.cloudinary.com/${cloud}/`)) {
    // Ask Cloudinary for a small JPEG rather than downloading the full original.
    return new URL(src.replace("/image/upload/", "/image/upload/c_limit,w_600,h_600,f_jpg,q_75/"));
  }
  return null;
}

async function fetchImage(url: URL): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok || !(res.headers.get("content-type") ?? "").startsWith("image/")) return null;
    if (Number(res.headers.get("content-length") ?? 0) > MAX_SOURCE_BYTES) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > MAX_SOURCE_BYTES ? null : buf;
  } catch {
    return null;
  }
}

/** A product photo as a small JPEG for embedding, or null to show a placeholder. */
async function loadPhoto(src: string | null, origin: string): Promise<Uint8Array | null> {
  const url = src ? photoUrl(src, origin) : null;
  if (!url) return null;
  const original = await fetchImage(url);
  if (!original) return null;
  try {
    // PDFs only embed JPEG and PNG; many product photos are WebP.
    return await sharp(original)
      .rotate()
      .resize(600, 600, { fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 75, mozjpeg: true })
      .toBuffer();
  } catch {
    return null;
  }
}

async function mapLimited<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const catalog = CATALOGS.find((c) => c.file === file);
  if (!catalog) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const origin = req.nextUrl.origin;
  let products;
  try {
    products = await getCatalogProducts(catalog.specialty);
  } catch {
    // Never serve (or let the CDN cache) an empty catalog because the
    // database was briefly unreachable.
    return NextResponse.json({ error: "Catalog temporarily unavailable" }, { status: 503, headers: { "Retry-After": "60" } });
  }

  const [settings, logo, photos] = await Promise.all([
    getSiteSettings(),
    fetchImage(new URL(LOGO_PATH, origin)),
    mapLimited(products, PHOTO_CONCURRENCY, (product) => loadPhoto(product.image, origin)),
  ]);

  // Links inside the PDF are tagged so Google Analytics shows the visits it sends.
  const utm = `utm_source=catalog_pdf&utm_medium=pdf&utm_campaign=${catalog.specialty}`;
  const pdf = await buildCatalogPdf({
    title: catalog.title,
    products: products.map((product, i) => ({
      name: product.name,
      brand: product.brand,
      category: product.category,
      summary: product.summary,
      url: `${SITE_URL}/products/${product.slug}?${utm}`,
      photo: photos[i],
    })),
    logo,
    contact: {
      phone: settings.phone || "929-349-8569",
      email: settings.email || "info@mpmedpharma.com",
      website: "www.mpmedpharma.com",
      websiteUrl: `${SITE_URL}/?${utm}`,
    },
    generatedAt: new Date(),
  });

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="MP-MedPharma-${catalog.specialty}-catalog.pdf"`,
      // Cached at the edge for an hour, so a burst of scans at a trade show
      // doesn't rebuild the PDF each time; after a sale it can lag by that long.
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=3600",
      // The product pages are the ones that belong in search results, not a
      // PDF duplicating them.
      "X-Robots-Tag": "noindex",
    },
  });
}
