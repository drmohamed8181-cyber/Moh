import { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { safeDb } from "@/lib/prisma";
import { LISTING_PRODUCT_SELECT, withPublicPrice } from "@/lib/productSelect";
import { getDefaultProductListing, getPublicCategories } from "@/lib/publicData";
import { jsonLdScript } from "@/lib/jsonLd";
import ProductCard from "@/components/product/ProductCard";
import ProductsSortSelect from "@/components/shop/ProductsSortSelect";
import InStockFilter from "@/components/shop/InStockFilter";
import { SlidersHorizontal } from "lucide-react";
import {
  DENTAL_CATEGORY_SLUGS,
  HIDDEN_CATEGORY_SLUGS,
  NON_OPHTHALMOLOGY_CATEGORY_SLUGS,
  PUBLIC_DENTAL_CATEGORY_SLUGS,
  SPECIALTIES,
} from "@/lib/specialties";

// This route reads searchParams, so it is dynamic by definition and cannot be
// prerendered. What was costing crawls was the database work behind it, and
// that is now served from the tagged Data Cache for the unfiltered listing —
// the only variant a crawler ever requests. Filtered views stay live.
export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 12;

const LISTING_TITLE = "All Ophthalmic Equipment for Sale – New & Refurbished";
const LISTING_DESCRIPTION =
  "Browse every ophthalmic laser, phaco system, OCT, slit lamp and surgical microscope in stock at MP MedPharma. New and certified refurbished, with warranty. Request a quote or a private demo.";

/**
 * Canonical for the listing.
 *
 * Every variant used to declare /products as its canonical, pagination
 * included. That tells Google page two is a duplicate of page one, which
 * makes the pagination a dead end for a crawler walking the catalogue.
 * Pages now point at themselves; filters and sorts still fold onto the bare
 * listing, which is what keeps faceted URLs out of the index.
 */
function canonicalFor(page: number): string {
  return page > 1 ? `/products?page=${page}` : "/products";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { page } = await searchParams;
  const pageNumber = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  return {
    title: pageNumber > 1 ? `${LISTING_TITLE} – Page ${pageNumber}` : LISTING_TITLE,
    description: LISTING_DESCRIPTION,
    alternates: { canonical: canonicalFor(pageNumber) },
  };
}



/**
 * One page of a filtered or sorted listing. Throws rather than degrading when
 * the database is unreachable: this page used to answer with twelve invented
 * products — a blood pressure monitor, a hospital bed — none of which exist in
 * this catalogue, at HTTP 200. Serving fabricated stock to a buyer is worse
 * than an error, and serving it to a crawler is how a site teaches Google not
 * to trust its URLs.
 */
async function loadFilteredListing(
  where: Prisma.ProductWhereInput,
  orderBy: Prisma.ProductOrderByWithRelationInput,
  skip: number
) {
  const [rows, total] = await Promise.all([
    safeDb((db) =>
      db.product.findMany({ where, orderBy, skip, take: ITEMS_PER_PAGE, select: { ...LISTING_PRODUCT_SELECT, category: true } })
    ),
    safeDb((db) => db.product.count({ where })),
  ]);
  if (!rows || total === null) throw new Error("Product catalogue unavailable");
  return { products: rows.map(withPublicPrice), total };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string; specialty?: string; sort?: string; featured?: string; q?: string; page?: string; inStock?: string }> }) {
  const sp = await searchParams;
  // parseInt("abc") is NaN, which made skip NaN and the query return nothing.
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const activeSpecialty =
    sp.specialty ?? (sp.category ? (DENTAL_CATEGORY_SLUGS.includes(sp.category) ? "dental" : "ophthalmology") : undefined);

  const where: Prisma.ProductWhereInput = {};
  if (sp.category) where.category = HIDDEN_CATEGORY_SLUGS.includes(sp.category) ? { slug: "__none__" } : { slug: sp.category };
  else if (sp.specialty === "dental") where.category = { slug: { in: PUBLIC_DENTAL_CATEGORY_SLUGS } };
  // Ophthalmology used to mean "everything not hidden", which worked only while
  // it was the sole visible specialty. Now that Dental is live it has to exclude
  // the other specialties' categories too, or the chairs land under it.
  else if (sp.specialty === "ophthalmology") where.category = { slug: { notIn: NON_OPHTHALMOLOGY_CATEGORY_SLUGS } };
  else if (sp.specialty === "dermatology") where.id = "__none__";
  else where.category = { slug: { notIn: HIDDEN_CATEGORY_SLUGS } };
  if (sp.featured === "true") where.isFeatured = true;
  if (sp.q) where.name = { contains: sp.q, mode: "insensitive" };
  if (sp.inStock === "true") where.isAvailable = true;

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sp.sort === "price-asc" ? { price: "asc" }
    : sp.sort === "price-desc" ? { price: "desc" }
    : sp.sort === "newest" ? { createdAt: "desc" }
    : { isFeatured: "desc" };

  // Anything that narrows or reorders the catalogue makes this a one-off
  // query. The bare listing is the same for everyone, so it comes from the
  // cache instead.
  const isDefaultListing = !sp.category && !sp.specialty && !sp.featured && !sp.q && !sp.inStock && !sp.sort;

  const [listing, categories] = await Promise.all([
    isDefaultListing
      ? getDefaultProductListing(page, ITEMS_PER_PAGE)
      : loadFilteredListing(where, orderBy, skip),
    getPublicCategories(),
  ]);

  const { products, total } = listing;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, i) => ({
      "@type": "ListItem",
      position: skip + i + 1,
      url: `https://www.mpmedpharma.com/products/${product.slug}`,
      name: product.name,
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(itemListJsonLd) }}
      />
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">All Products</h1>
          <p className="text-gray-500 text-sm">
            {products.length} products{sp.q && ` for "${sp.q}"`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border p-5 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <SlidersHorizontal size={16} /> Filters
              </h3>
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Specialty</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/products" className={`block text-sm py-1 ${!sp.category && !sp.specialty ? "text-primary-600 font-medium" : "text-gray-600 hover:text-primary-600"}`}>
                      All Specialties
                    </Link>
                  </li>
                  {SPECIALTIES.map((s) =>
                    s.comingSoon ? (
                      <li key={s.slug}>
                        <span className="flex items-center justify-between text-sm py-1 text-gray-300 cursor-not-allowed">
                          {s.name}
                          <span className="text-[10px] uppercase tracking-wide">Soon</span>
                        </span>
                      </li>
                    ) : (
                      <li key={s.slug}>
                        <Link href={`/products?specialty=${s.slug}`}
                          className={`block text-sm py-1 ${activeSpecialty === s.slug ? "text-primary-600 font-medium" : "text-gray-600 hover:text-primary-600"}`}>
                          {s.name}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Equipment Type</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/products" className={`block text-sm py-1 ${!sp.category ? "text-primary-600 font-medium" : "text-gray-600 hover:text-primary-600"}`}>
                      All Categories
                    </Link>
                  </li>
                  {(categories ?? []).map((cat) => (
                    <li key={cat.id}>
                      <Link href={`/products?category=${cat.slug}`}
                        className={`block text-sm py-1 ${sp.category === cat.slug ? "text-primary-600 font-medium" : "text-gray-600 hover:text-primary-600"}`}>
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Availability</h4>
                <InStockFilter />
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">{products.length} products</p>
              <ProductsSortSelect />
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border">
                <p className="text-gray-600 mb-1">
                  {activeSpecialty === "dermatology" ? "Our Dermatology line is launching soon." : "No products found."}
                </p>
                <p className="text-gray-400 text-sm">
                  <Link href="/products" className="text-primary-600 hover:underline">Browse all products</Link>
                </p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const pageParams = new URLSearchParams();
                  if (sp.category) pageParams.set("category", sp.category);
                  if (sp.specialty) pageParams.set("specialty", sp.specialty);
                  if (sp.sort) pageParams.set("sort", sp.sort);
                  if (sp.featured) pageParams.set("featured", sp.featured);
                  if (sp.q) pageParams.set("q", sp.q);
                  if (sp.inStock) pageParams.set("inStock", sp.inStock);
                  pageParams.set("page", String(p));
                  return (
                    <Link key={p} href={`/products?${pageParams.toString()}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                        p === page ? "bg-primary-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:border-primary-300"
                      }`}>
                      {p}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
