import { safeDb } from "@/lib/prisma";
import { WATERMARK_PRODUCTS_KEY, parseWatermarkProductIds } from "@/lib/watermark";

export async function isProductWatermarked(productId: string): Promise<boolean> {
  const setting = await safeDb((db) => db.siteSetting.findUnique({ where: { key: WATERMARK_PRODUCTS_KEY } }));
  return parseWatermarkProductIds(setting?.value).has(productId);
}

/**
 * Turns the logo stamp on or off for one product. Callers must expire
 * PRODUCTS_TAG afterwards so the cached public pages pick it up.
 */
export async function setProductWatermark(productId: string, on: boolean): Promise<void> {
  const setting = await safeDb((db) => db.siteSetting.findUnique({ where: { key: WATERMARK_PRODUCTS_KEY } }));
  const ids = parseWatermarkProductIds(setting?.value);
  if (ids.has(productId) === on) return;
  if (on) ids.add(productId);
  else ids.delete(productId);
  const value = JSON.stringify([...ids]);
  await safeDb((db) => db.siteSetting.upsert({
    where: { key: WATERMARK_PRODUCTS_KEY },
    create: { key: WATERMARK_PRODUCTS_KEY, value },
    update: { value },
  }));
}
