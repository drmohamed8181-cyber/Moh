// Fields safe to expose on public/customer-facing pages. Deliberately
// excludes dealerPrice/retailPrice — confidential distributor pricing that
// must never reach an unauthenticated browser (client components/JSON
// responses serialize whatever fields a query returns). Admin views should
// use ADMIN_PRODUCT_SELECT below instead; src/app/api/contact/route.ts also
// reads those two fields directly, via its own explicit select.
export const PUBLIC_PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  categoryId: true,
  brandId: true,
  manufacturer: true,
  price: true,
  discountPrice: true,
  images: true,
  shortDesc: true,
  description: true,
  specifications: true,
  features: true,
  accessories: true,
  indications: true,
  clinicalEvidence: true,
  isAvailable: true,
  stockQty: true,
  weight: true,
  dimensions: true,
  warranty: true,
  isFeatured: true,
  seoTitle: true,
  seoDesc: true,
  createdAt: true,
  updatedAt: true,
} as const;

// For admin-only views (product list/edit, already gated by role in
// AdminLayout and the product API routes) — includes confidential
// dealer/retail pricing on top of the public fields.
export const ADMIN_PRODUCT_SELECT = {
  ...PUBLIC_PRODUCT_SELECT,
  dealerPrice: true,
  retailPrice: true,
  previousRetailPrice: true,
  retailPricePublic: true,
} as const;

// For public listing/detail pages — same public fields, plus the retail
// price (and the pre-price-drop snapshot) and its publish flag so
// withPublicPrice() can decide whether to surface them. dealerPrice is
// never included here.
export const LISTING_PRODUCT_SELECT = {
  ...PUBLIC_PRODUCT_SELECT,
  retailPrice: true,
  previousRetailPrice: true,
  retailPricePublic: true,
} as const;

// Strips retailPrice/previousRetailPrice/retailPricePublic out of a query
// result fetched with LISTING_PRODUCT_SELECT and replaces them with
// publicPrice/previousPublicPrice — both null unless the admin has
// explicitly published the price — so the raw fields never get serialized
// into a page passed to a client component for an unpublished product.
export function withPublicPrice<T extends { retailPrice: number | null; previousRetailPrice: number | null; retailPricePublic: boolean }>(
  product: T
): Omit<T, "retailPrice" | "previousRetailPrice" | "retailPricePublic"> & { publicPrice: number | null; previousPublicPrice: number | null } {
  const { retailPrice, previousRetailPrice, retailPricePublic, ...rest } = product;
  return {
    ...rest,
    publicPrice: retailPricePublic ? retailPrice : null,
    previousPublicPrice: retailPricePublic ? previousRetailPrice : null,
  };
}
