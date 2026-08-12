import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const userId = session.user.id;

  const existing = await safeDb((db) => db.address.findUnique({ where: { id } }));
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  if (body.isDefault) {
    await safeDb((db) => db.address.updateMany({ where: { userId }, data: { isDefault: false } }));
  }

  const address = await safeDb((db) => db.address.update({ where: { id }, data: body }));
  return NextResponse.json({ address });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const userId = session.user.id;

  const existing = await safeDb((db) => db.address.findUnique({ where: { id } }));
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await safeDb((db) => db.address.delete({ where: { id } }));
  return NextResponse.json({ success: true });
}
