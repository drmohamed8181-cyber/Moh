import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";
import { deleteImage } from "@/lib/cloudinary";

async function checkAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  return ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"].includes(role ?? "");
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const file = await safeDb((db) => db.mediaFile.findUnique({ where: { id } }));
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteImage(file.publicId).catch(() => {});
  await safeDb((db) => db.mediaFile.delete({ where: { id } }));

  return NextResponse.json({ success: true });
}
