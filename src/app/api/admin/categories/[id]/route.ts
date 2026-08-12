import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";

async function checkAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  return ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"].includes(role ?? "");
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const category = await safeDb((db) => db.category.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      image: body.image || null,
      order: body.order ?? 0,
      isActive: body.isActive ?? true,
    },
  }));

  if (!category) return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  return NextResponse.json(category);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const result = await safeDb((db) => db.category.delete({ where: { id } }));
  if (!result) return NextResponse.json({ error: "Failed to delete category. It may still have products assigned to it." }, { status: 409 });
  return NextResponse.json({ success: true });
}
