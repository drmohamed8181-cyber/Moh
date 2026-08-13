import { NextRequest, NextResponse } from "next/server";
import { uploadPrivateImage } from "@/lib/cloudinary";
import { validateImageDataUri } from "@/lib/fileValidation";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const MAX_UPLOADS_PER_WINDOW = 60; // up to ~12 photos, with a few retries/replacements
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!checkRateLimit(`sell-upload:${ip}`, MAX_UPLOADS_PER_WINDOW, WINDOW_MS)) {
      return NextResponse.json({ error: "Too many uploads. Please wait a few minutes and try again." }, { status: 429 });
    }

    const body = await req.json();
    const { data, label } = body ?? {};

    const validation = validateImageDataUri(data);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const result = await uploadPrivateImage(data, "medpharma/sell-submissions");

    return NextResponse.json({ publicId: result.publicId, label: typeof label === "string" ? label : null });
  } catch (error) {
    console.error("product-submissions/upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
