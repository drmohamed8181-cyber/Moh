import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import type { Prisma } from "@prisma/client";
import { safeDb } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { HIDDEN_CATEGORY_SLUGS } from "@/lib/specialties";
import { PRODUCTS_TAG, readWatermarkIds } from "@/lib/publicData";
import { setProductWatermark } from "@/lib/watermarkAdmin";
import { LISTING_PRODUCT_SELECT, withPublicPrice } from "@/lib/productSelect";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "12");
    const category = searchParams.get("category");
    const manufacturer = searchParams.get("manufacturer");
    const q = searchParams.get("q");
    const featured = searchParams.get("featured") === "true";

    const where: Prisma.ProductWhereInput = {};
    if (category) where.category = HIDDEN_CATEGORY_SLUGS.includes(category) ? { slug: "__none__" } : { slug: category };
    else where.category = { slug: { notIn: HIDDEN_CATEGORY_SLUGS } };
    if (manufacturer) where.manufacturer = manufacturer;
    if (featured) where.isFeatured = true;
    if (q) where.name = { contains: q, mode: "insensitive" };

    const products = await safeDb((db) => db.product.findMany({
      where, skip: (page - 1) * limit, take: limit,
      select: { ...LISTING_PRODUCT_SELECT, category: true }, orderBy: { name: "asc" },
    }));
    const total = await safeDb((db) => db.product.count({ where }));

    const watermarkIds = await readWatermarkIds();
    return NextResponse.json({ products: (products ?? []).map((p) => withPublicPrice(p, watermarkIds)), total: total ?? 0, page, pages: Math.ceil((total ?? 0) / limit) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { watermark, ...body } = await req.json();
    const product = await safeDb((db) => db.product.create({ data: body }));
    // The logo stamp lives in a site setting, not on the product row.
    if (product && watermark === true) await setProductWatermark(product.id, true);
    // Let the new product appear on the cached public listing/detail pages.
    revalidateTag(PRODUCTS_TAG, { expire: 0 });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
