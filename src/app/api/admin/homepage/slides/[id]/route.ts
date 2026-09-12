import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { safeDb } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { HERO_SLIDES_TAG } from "@/lib/publicData";

async function checkAdmin() {
  try {
    const session = await auth();
    return !!session?.user && ["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER"].includes(session.user.role);
  } catch {
    return false;
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const slide = await safeDb((db) => db.heroSlide.update({ where: { id }, data: body }));
    revalidateTag(HERO_SLIDES_TAG, { expire: 0 });
    return NextResponse.json(slide);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await safeDb((db) => db.heroSlide.delete({ where: { id } }));
    revalidateTag(HERO_SLIDES_TAG, { expire: 0 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
