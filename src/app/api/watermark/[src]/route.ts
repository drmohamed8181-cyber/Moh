import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { canWatermark } from "@/lib/watermark";

// Serves a product photo with the MP MedPharma logo stamped in its bottom-right
// corner. The path segment is the original image's URL, base64url-encoded (see
// watermarkedSrc in src/lib/watermark.ts). The logo is burned into the image
// itself, so a saved or shared copy keeps it.

const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
// Longest side of the stamped image. Product photos never display larger, and
// <Image> scales it down further per screen.
const MAX_OUTPUT_SIDE = 2000;
const LOGO_PATH = "/brand/mp-logo-full.png";

let logoPromise: Promise<Buffer> | null = null;

async function fetchBytes(url: URL): Promise<Buffer | null> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const type = res.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) return null;
  const length = Number(res.headers.get("content-length") ?? 0);
  if (length > MAX_SOURCE_BYTES) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.length > MAX_SOURCE_BYTES ? null : buf;
}

function getLogo(origin: string): Promise<Buffer> {
  if (!logoPromise) {
    logoPromise = fetchBytes(new URL(LOGO_PATH, origin)).then((buf) => {
      if (!buf) throw new Error("Watermark logo unavailable");
      return buf;
    });
    // Don't keep a failed fetch around; try again on the next request.
    logoPromise.catch(() => { logoPromise = null; });
  }
  return logoPromise;
}

function sourceUrl(src: string, origin: string): URL | null {
  if (!canWatermark(src) || src.includes("..")) return null;
  if (src.startsWith("https://")) {
    // Only this site's own Cloudinary account, not anyone's.
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (cloud && !src.startsWith(`https://res.cloudinary.com/${cloud}/`)) return null;
    return new URL(src);
  }
  return new URL(src, origin);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ src: string }> }) {
  const { src: encoded } = await params;
  const src = Buffer.from(encoded, "base64url").toString("utf8");
  const origin = req.nextUrl.origin;
  const url = sourceUrl(src, origin);
  if (!url) return NextResponse.json({ error: "Image not allowed" }, { status: 400 });

  try {
    const [original, logo] = await Promise.all([fetchBytes(url), getLogo(origin)]);
    if (!original) return NextResponse.json({ error: "Image not found" }, { status: 404 });

    const { data: base, info } = await sharp(original)
      .rotate()
      .resize({ width: MAX_OUTPUT_SIDE, height: MAX_OUTPUT_SIDE, fit: "inside", withoutEnlargement: true })
      .toBuffer({ resolveWithObject: true });
    const { width, height } = info;

    // Logo about a quarter of the photo's width, inset from the corner, on a
    // soft white pill so it stays readable on dark photos too.
    const logoWidth = Math.max(80, Math.round(width * 0.26));
    const resizedLogo = await sharp(logo).resize({ width: logoWidth }).toBuffer({ resolveWithObject: true });
    const pad = Math.round(logoWidth * 0.05);
    const badgeW = resizedLogo.info.width + pad * 2;
    const badgeH = resizedLogo.info.height + pad * 2;
    const margin = Math.round(Math.min(width, height) * 0.03);
    const left = Math.max(0, width - badgeW - margin);
    const top = Math.max(0, height - badgeH - margin);
    const radius = Math.round(badgeH / 2);

    const badge = await sharp({
      create: { width: badgeW, height: badgeH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([
        {
          input: Buffer.from(
            `<svg xmlns="http://www.w3.org/2000/svg" width="${badgeW}" height="${badgeH}"><rect width="${badgeW}" height="${badgeH}" rx="${radius}" fill="#ffffff" fill-opacity="0.72"/></svg>`
          ),
        },
        { input: resizedLogo.data, left: pad, top: pad },
      ])
      .png()
      .toBuffer();

    // Slightly see-through, so it reads as a stamp rather than covering the device.
    const faded = await sharp(badge)
      .ensureAlpha()
      .composite([
        {
          input: Buffer.from([255, 255, 255, Math.round(255 * 0.85)]),
          raw: { width: 1, height: 1, channels: 4 },
          tile: true,
          blend: "dest-in",
        },
      ])
      .png()
      .toBuffer();

    const stamped = await sharp(base)
      .composite([{ input: faded, left, top }])
      .webp({ quality: 88 })
      .toBuffer();

    return new NextResponse(new Uint8Array(stamped), {
      headers: {
        "Content-Type": "image/webp",
        // The same source URL always stamps to the same image (Cloudinary URLs
        // change when a photo is replaced), so let the CDN keep it.
        "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Watermark failed:", error);
    return NextResponse.json({ error: "Could not stamp image" }, { status: 500 });
  }
}
