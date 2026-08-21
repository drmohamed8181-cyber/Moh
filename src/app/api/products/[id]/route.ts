import { NextRequest, NextResponse } from "next/server";
import { safeDb } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();

    // Track price drops on the end-user price so the public page can show a
    // "was X, now Y" strikethrough. If the new price is lower than what's
    // currently stored, snapshot the old value; if it goes back up (or is
    // cleared), there's no more drop to show.
    if (Object.prototype.hasOwnProperty.call(body, "retailPrice")) {
      const current = await safeDb((db) => db.product.findUnique({ where: { id }, select: { retailPrice: true } }));
      const oldPrice = current?.retailPrice ?? null;
      const newPrice = body.retailPrice as number | null;
      if (newPrice !== oldPrice) {
        if (oldPrice != null && newPrice != null && newPrice < oldPrice) {
          body.previousRetailPrice = oldPrice;
        } else {
          body.previousRetailPrice = null;
        }
      }
    }

    const product = await safeDb((db) => db.product.update({ where: { id }, data: body }));
    return NextResponse.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await safeDb((db) => db.product.delete({ where: { id } }));
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
