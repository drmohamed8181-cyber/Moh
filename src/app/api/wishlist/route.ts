import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ ids: [] });
  const userId = session.user.id;

  const items = await safeDb((db) => db.wishlistItem.findMany({
    where: { userId },
    select: { productId: true },
  })) ?? [];

  return NextResponse.json({ ids: items.map((i) => i.productId) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const userId = session.user.id;
  const existing = await safeDb((db) => db.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  }));

  if (existing) {
    await safeDb((db) => db.wishlistItem.delete({ where: { id: existing.id } }));
    return NextResponse.json({ wishlisted: false });
  }

  await safeDb((db) => db.wishlistItem.create({ data: { userId, productId } }));
  return NextResponse.json({ wishlisted: true });
}
