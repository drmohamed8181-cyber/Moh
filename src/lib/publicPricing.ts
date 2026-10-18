// The price shown to the public is not the partner's suggested end-user price
// (Product.retailPrice) but that price plus a markup, so the owner has room to
// negotiate down to it. retailPrice stays the private floor: the internal
// pricing email shows both. Only products whose price the admin has published
// (retailPricePublic) show any price at all.
export const PUBLIC_PRICE_MARKUP = 0.1;

// Rounded to the nearest $500 from $10,000, and to the nearest $100 below.
export function publicListPrice(retailPrice: number | null | undefined): number | null {
  if (retailPrice == null || !(retailPrice > 0)) return null;
  const raw = retailPrice * (1 + PUBLIC_PRICE_MARKUP);
  const step = raw >= 10000 ? 500 : 100;
  return Math.round(raw / step) * step;
}
