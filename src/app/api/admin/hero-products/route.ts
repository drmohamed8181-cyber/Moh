import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { safeDb } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { HERO_SLIDES_TAG, SITE_SETTINGS_TAG } from "@/lib/publicData";
import { HERO_PRODUCTS_KEY, parseHeroProductIds } from "@/lib/heroProducts";

async function checkAdmin() {
  try {
    const session = await auth();
    return !!session?.user && ["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER"].includes(session.user.role);
  } catch {
    return false;
  }
}

async function readIds() {
  const setting = await safeDb((db) => db.siteSetting.findUnique({ where: { key: HERO_PRODUCTS_KEY } }));
  return parseHeroProductIds(setting?.value);
}

async function writeIds(ids: string[]) {
  const value = JSON.stringify([...new Set(ids)]);
  await safeDb((db) => db.siteSetting.upsert({
    where: { key: HERO_PRODUCTS_KEY },
    create: { key: HERO_PRODUCTS_KEY, value },
    update: { value },
  }));
  // The homepage hero reads this setting; expire it so the change shows now.
  revalidateTag(SITE_SETTINGS_TAG, { expire: 0 });
  revalidateTag(HERO_SLIDES_TAG, { expire: 0 });
}

// Add or remove one product: { productId, show }.
export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productId, show } = await req.json();
  if (typeof productId !== "string" || typeof show !== "boolean") {
    return NextResponse.json({ error: "productId and show are required" }, { status: 400 });
  }
  const ids = (await readIds()).filter((id) => id !== productId);
  if (show) ids.push(productId);
  await writeIds(ids);
  return NextResponse.json({ ids });
}

// Replace the whole list, e.g. after reordering: { ids }.
export async function PUT(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ids } = await req.json();
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string")) {
    return NextResponse.json({ error: "ids must be a list of product ids" }, { status: 400 });
  }
  await writeIds(ids);
  return NextResponse.json({ ids });
}
