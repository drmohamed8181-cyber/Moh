import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { PRODUCTS_TAG } from "@/lib/publicData";
import { setProductsWatermark } from "@/lib/watermarkAdmin";

// Turns the logo stamp on or off for one or more products:
// { productIds: string[], on: boolean }.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { productIds, on } = await req.json();
  if (!Array.isArray(productIds) || !productIds.every((id) => typeof id === "string") || typeof on !== "boolean") {
    return NextResponse.json({ error: "productIds and on are required" }, { status: 400 });
  }
  const ids = await setProductsWatermark(productIds, on);
  // Product pages and listings carry the flag inside their cache entries.
  revalidateTag(PRODUCTS_TAG, { expire: 0 });
  return NextResponse.json({ count: ids.size });
}
