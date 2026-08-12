import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (!role || !["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { data, folder, name } = body;

    if (!data) return NextResponse.json({ error: "No image data" }, { status: 400 });

    const result = await uploadImage(data, folder ?? "medpharma");

    const mediaFile = await safeDb((db) => db.mediaFile.create({
      data: {
        url: result.url,
        publicId: result.publicId,
        name: name || result.publicId.split("/").pop() || "upload",
        folder: folder ?? "medpharma",
      },
    }));

    return NextResponse.json({ ...result, mediaId: mediaFile?.id ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
