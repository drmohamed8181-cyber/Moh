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
} as const;
