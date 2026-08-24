import { NextRequest, NextResponse } from "next/server";
import { safeDb } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const slide = await safeDb((db) => db.heroSlide.create({ data: body }));
    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
