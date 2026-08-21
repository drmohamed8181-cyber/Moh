// Fields safe to expose publicly and in the admin UI. Deliberately excludes
// dealerPrice/retailPrice — confidential distributor pricing that must never
// reach the browser (client components/JSON responses serialize whatever
// fields a query returns). src/app/api/contact/route.ts is the one place
// allowed to read those two fields, via its own explicit select.
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
