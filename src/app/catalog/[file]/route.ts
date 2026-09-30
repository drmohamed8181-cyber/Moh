import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse, after } from "next/server";
import sharp from "sharp";
import { buildCatalogPdf } from "@/lib/catalogPdf";
import { CATALOGS, type Catalog } from "@/lib/catalogs";
import { isCountableDownload, recordCatalogDownload } from "@/lib/catalogDownloads";
import { getCatalogProducts, getSiteSettings, type CatalogProduct } from "@/lib/publicData";
import { SITE_URL } from "@/lib/seo";

// The downloadable equipment catalogs, one per specialty:
//   /catalog/ophthalmology.pdf
//   /catalog/dental.pdf
// Printed QR codes point here, so the PDF is built from the live listings: a
// sold unit drops out and a new one appears without anything being reprinted.
// Each download is counted for the admin dashboard. The list of catalogs is src/lib/catalogs.ts.

// Reading and shrinking a few dozen photos takes a while on a cold start.
export const maxDuration = 60;

const LOGO_PATH = "/brand/mp-logo-full.png";
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const PHOTO_CONCURRENCY = 6;
// Large enough for the cover, where a few photos are shown big.
const PHOTO_SIDE = 900;

/** Whether src is a file this site serves from public/ (and not a route). */
function isSiteFile(src: string): boolean {
  return src.startsWith("/") && !src.startsWith("//") && !src.startsWith("/api/") && !src.startsWith("/_next/") && !src.includes("..");
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

/**
 * The bytes of an image from this site's own files or its own Cloudinary
 * account, and nothing else, so the route can't be pointed at an arbitrary
 * host and never embeds a photo hotlinked from someone else's site.
 *
 * Site files are read from disk (next.config.ts bundles public/ with this
 * route): fetching them over HTTP from our own origin fails on preview
 * deployments, whose protection answers the server's request with a login
 * page. The HTTP fetch stays as a fallback.
 */
async function loadImage(src: string, origin: string): Promise<Buffer | null> {
  if (isSiteFile(src)) {
    try {
      return await readFile(path.join(process.cwd(), "public", decodeURIComponent(src)));
    } catch {
      return fetchImage(new URL(src, origin));
    }
  }
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (cloud && src.startsWith(`https://res.cloudinary.com/${cloud}/`)) {
    // Ask Cloudinary for a smaller JPEG rather than downloading the full original.
    return fetchImage(new URL(src.replace("/image/upload/", `/image/upload/c_limit,w_${PHOTO_SIDE},h_${PHOTO_SIDE},f_jpg,q_80/`)));
  }
  return null;
}

/** A product photo as a JPEG for embedding, or null to show a placeholder. */
async function loadPhoto(src: string | null, origin: string): Promise<Uint8Array | null> {
  const original = src ? await loadImage(src, origin) : null;
  if (!original || original.length > MAX_SOURCE_BYTES) return null;
  try {
    // PDFs only embed JPEG and PNG; many product photos are WebP.
    return await sharp(original)
      .rotate()
      .resize(PHOTO_SIDE, PHOTO_SIDE, { fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 78, mozjpeg: true })
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

type BuiltCatalog = { key: string; pdf: Promise<Uint8Array> };

// The last PDF built for each catalog on this server instance. Every request
// has to reach this function to be counted (see src/lib/catalogDownloads.ts),
// so the CDN can no longer cache the file; instead a PDF is rebuilt only when
// its content would change: the listings, the contact details or the date on
// the cover.
const built = new Map<string, BuiltCatalog>();

export async function GET(req: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const catalog = CATALOGS.find((c) => c.file === file);
  if (!catalog) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const origin = req.nextUrl.origin;
  let products;
  try {
    products = await getCatalogProducts(catalog.specialty);
  } catch {
    // Never serve an empty catalog because the database was briefly unreachable.
    return NextResponse.json({ error: "Catalog temporarily unavailable" }, { status: 503, headers: { "Retry-After": "60" } });
  }
  const settings = await getSiteSettings();
  const contact = {
    phone: settings.phone || "929-349-8569",
    email: settings.email || "info@mpmedpharma.com",
  };
  const today = new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" });
  const key = JSON.stringify([products, contact, today]);

  let entry = built.get(file);
  if (!entry || entry.key !== key) {
    entry = { key, pdf: buildPdf(catalog, products, contact, origin) };
    built.set(file, entry);
  }
  let pdf: Uint8Array;
  try {
    pdf = await entry.pdf;
  } catch (error) {
    // Don't keep serving a failed build.
    if (built.get(file) === entry) built.delete(file);
    throw error;
  }

  if (isCountableDownload(req)) {
    after(() => recordCatalogDownload(req, catalog.specialty));
  }

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="MP-MedPharma-${catalog.specialty}-catalog.pdf"`,
      // Not cached by the CDN or the browser, so every download is counted.
      "Cache-Control": "private, no-store",
      // The product pages are the ones that belong in search results, not a
      // PDF duplicating them.
      "X-Robots-Tag": "noindex",
    },
  });
}

async function buildPdf(
  catalog: Catalog,
  products: CatalogProduct[],
  contact: { phone: string; email: string },
  origin: string
): Promise<Uint8Array> {
  const [logo, photos] = await Promise.all([
    loadImage(LOGO_PATH, origin),
    mapLimited(products, PHOTO_CONCURRENCY, (product) => loadPhoto(product.image, origin)),
  ]);

  // Links inside the PDF are tagged so Google Analytics shows the visits it sends.
  const utm = `utm_source=catalog_pdf&utm_medium=pdf&utm_campaign=${catalog.specialty}`;
  return buildCatalogPdf({
    title: catalog.title,
    intro: catalog.intro,
    products: products.map((product, i) => ({
      name: product.name,
      brand: product.brand,
      category: product.category,
      summary: product.summary,
      url: `${SITE_URL}/products/${product.slug}?${utm}`,
      photo: photos[i],
    })),
    logo,
    contact: { ...contact, website: "www.mpmedpharma.com", websiteUrl: `${SITE_URL}/?${utm}` },
    generatedAt: new Date(),
  });
}
