import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, phone } = await req.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const userId = session.user.id;
  const user = await safeDb((db) => db.user.update({
    where: { id: userId },
    data: { name: name.trim(), phone: phone?.trim() || null },
  }));

  if (!user) return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  return NextResponse.json({ success: true });
}
