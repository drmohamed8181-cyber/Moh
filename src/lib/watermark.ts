// Products whose photos get the MP MedPharma logo stamped on them, stored as a
// JSON array of product ids under one SiteSetting key — like heroProductIds, a
// setting rather than a new column so no database migration is needed.
//
// Off unless an admin turns it on per product: only photos we own or have
// permission to modify should carry our logo. Structured data, the sitemap and
// other feeds keep the original image URLs, so Google (whose Merchant Center
// rejects watermarked product images) always gets the clean photo.
export const WATERMARK_PRODUCTS_KEY = "watermarkProductIds";

export function parseWatermarkProductIds(value: string | null | undefined): Set<string> {
  if (!value) return new Set();
  try {
    const parsed = JSON.parse(value);
    return new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

// Only our own files and Cloudinary uploads can be stamped (the route in
// src/app/api/watermark/[src]/route.ts fetches the original); anything else is
// shown as is.
export function canWatermark(src: string): boolean {
  return (
    (src.startsWith("/") && !src.startsWith("//") && !src.startsWith("/api/") && !src.startsWith("/_next/")) ||
    src.startsWith("https://res.cloudinary.com/")
  );
}

// The original image's URL goes in the path, base64url-encoded, rather than in
// a query string: Next 16's <Image> refuses local sources with a query string
// unless images.localPatterns lists them.
export function watermarkedSrc(src: string): string {
  if (!canWatermark(src)) return src;
  const bytes = new TextEncoder().encode(src);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const encoded = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `/api/watermark/${encoded}`;
}
