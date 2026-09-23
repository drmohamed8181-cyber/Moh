import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { safeDb } from "@/lib/prisma";
import { HIDDEN_CATEGORY_SLUGS } from "@/lib/specialties";

const LIMIT = 8;

// Live suggestions for the site search box. Matches the same products as the
// /search page, but returns only what the dropdown shows — never prices.
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100);
  if (!q) return NextResponse.json({ suggestions: [], total: 0 });

  const where: Prisma.ProductWhereInput = {
    AND: [
      { OR: [
        { name: { contains: q, mode: "insensitive" } },
        { shortDesc: { contains: q, mode: "insensitive" } },
        { manufacturer: { contains: q, mode: "insensitive" } },
      ] },
      { category: { slug: { notIn: HIDDEN_CATEGORY_SLUGS } } },
    ],
  };

  const [products, total] = await Promise.all([
    safeDb((db) => db.product.findMany({
      where,
      select: { id: true, name: true, slug: true, images: true, manufacturer: true, category: { select: { name: true } } },
      // Pull a few extra so names that start with the query can be listed first.
      take: LIMIT * 3,
      orderBy: { name: "asc" },
    })),
    safeDb((db) => db.product.count({ where })),
  ]);

  const lower = q.toLowerCase();
  const score = (name: string) => {
    const n = name.toLowerCase();
    if (n.startsWith(lower)) return 0;
    if (n.split(/[\s\-/()]+/).some((w) => w.startsWith(lower))) return 1;
    if (n.includes(lower)) return 2;
    return 3;
  };

  const suggestions = (products ?? [])
    .sort((a, b) => score(a.name) - score(b.name))
    .slice(0, LIMIT)
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images[0] ?? null,
      subtitle: [p.category?.name, p.manufacturer].filter(Boolean).join(" · ") || null,
    }));

  return NextResponse.json({ suggestions, total: total ?? suggestions.length });
}
