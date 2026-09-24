import { safeDb } from "@/lib/prisma";
import { WATERMARK_PRODUCTS_KEY, parseWatermarkProductIds } from "@/lib/watermark";

export async function getWatermarkedProductIds(): Promise<Set<string>> {
  const setting = await safeDb((db) => db.siteSetting.findUnique({ where: { key: WATERMARK_PRODUCTS_KEY } }));
  return parseWatermarkProductIds(setting?.value);
}

export async function isProductWatermarked(productId: string): Promise<boolean> {
  return (await getWatermarkedProductIds()).has(productId);
}

/**
 * Turns the logo stamp on or off for some products. Callers must expire
 * PRODUCTS_TAG afterwards so the cached public pages pick it up.
 */
export async function setProductsWatermark(productIds: string[], on: boolean): Promise<Set<string>> {
  const ids = await getWatermarkedProductIds();
  const before = ids.size;
  for (const id of productIds) {
    if (on) ids.add(id);
    else ids.delete(id);
  }
  // Adding or removing an id always changes the size, so an equal size means nothing to write.
  if (ids.size === before) return ids;
  const value = JSON.stringify([...ids]);
  await safeDb((db) => db.siteSetting.upsert({
    where: { key: WATERMARK_PRODUCTS_KEY },
    create: { key: WATERMARK_PRODUCTS_KEY, value },
    update: { value },
  }));
  return ids;
}

export async function setProductWatermark(productId: string, on: boolean): Promise<void> {
  await setProductsWatermark([productId], on);
}
