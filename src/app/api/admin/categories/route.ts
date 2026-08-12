import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";

async function checkAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  return ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"].includes(role ?? "");
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.name || !body.slug) {
    return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
  }

  const category = await safeDb((db) => db.category.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      image: body.image || null,
      order: body.order ?? 0,
      isActive: body.isActive ?? true,
    },
  }));

  if (!category) return NextResponse.json({ error: "A category with that slug may already exist." }, { status: 409 });
  return NextResponse.json(category, { status: 201 });
}
