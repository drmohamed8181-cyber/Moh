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

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const slides = await safeDb((db) => db.heroSlide.findMany({ orderBy: { order: "asc" } })) ?? [];
  return NextResponse.json(slides);
}

// Save a new slide order: { ids } lists every slide id, first slide first.
export async function PUT(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const ids: unknown = body?.ids;
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string") || new Set(ids).size !== ids.length) {
    return NextResponse.json({ error: "ids must be a list of slide ids" }, { status: 400 });
  }
  const saved = await safeDb((db) => db.$transaction(
    ids.map((id, order) => db.heroSlide.update({ where: { id }, data: { order } }))
  ));
  if (!saved) return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  revalidateTag(HERO_SLIDES_TAG, { expire: 0 });
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const slide = await safeDb((db) => db.heroSlide.create({ data: body }));
    // The homepage is cached now, so an edit only appears once this tag is
    // expired. { expire: 0 } rather than a stale-while-revalidate profile:
    // the admin expects to see the slide immediately after saving.
    revalidateTag(HERO_SLIDES_TAG, { expire: 0 });
    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
