// Partner (LaserLocators) price drops, kept for the owner's eyes only.
//
// When a new distributor list lowers a unit's price, only our cost
// (Product.dealerPrice) follows it: the end-user price we quote stays where
// it was. The drop is recorded here instead, and the internal pricing email
// sent to the owner for each inquiry about that unit shows it, so the owner
// can decide case by case whether to pass any of it on.
//
// Stored as JSON under one SiteSetting key, keyed by product id — like
// watermarkProductIds, a setting rather than new columns so no migration is
// needed. Never read it from a public page, feed or customer email.
import { safeDb } from "@/lib/prisma";

export const PRICE_DROPS_KEY = "partnerPriceDrops";

export type PriceDrop = {
  /** Our cost before and after the drop. */
  previousDealerPrice: number;
  dealerPrice: number;
  /** The partner's suggested end-user price, if it dropped too. Ours is unchanged. */
  previousListRetail?: number | null;
  listRetail?: number | null;
  /** Which distributor list it came from, e.g. "Laser Locators mid-October 2026". */
  list: string;
  /** ISO date the drop was recorded. */
  date: string;
};

function isPriceDrop(value: unknown): value is PriceDrop {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.previousDealerPrice === "number" && typeof v.dealerPrice === "number" && typeof v.list === "string";
}

export function parsePriceDrops(value: string | null | undefined): Record<string, PriceDrop> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, PriceDrop] => isPriceDrop(entry[1])));
  } catch {
    return {};
  }
}

export async function getPriceDrop(productId: string): Promise<PriceDrop | null> {
  const setting = await safeDb((db) => db.siteSetting.findUnique({ where: { key: PRICE_DROPS_KEY } }));
  return parsePriceDrops(setting?.value)[productId] ?? null;
}
