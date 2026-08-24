import { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { safeDb } from "@/lib/prisma";
import { LISTING_PRODUCT_SELECT, withPublicPrice } from "@/lib/productSelect";
import { jsonLdScript } from "@/lib/jsonLd";
import ProductCard from "@/components/product/ProductCard";
import ProductsSortSelect from "@/components/shop/ProductsSortSelect";
import InStockFilter from "@/components/shop/InStockFilter";
import { SlidersHorizontal } from "lucide-react";
import { DENTAL_CATEGORY_SLUGS, HIDDEN_CATEGORY_SLUGS, SPECIALTIES } from "@/lib/specialties";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "All Products",
  description: "Browse our complete range of premium medical equipment.",
  alternates: { canonical: "/products" },
};

const ITEMS_PER_PAGE = 12;

const fallbackProducts = [
  { id: "1", name: "Digital Blood Pressure Monitor Pro", slug: "digital-bp-monitor-pro", price: 89.99, discountPrice: 69.99, images: ["https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&q=80"], shortDesc: "Clinical-grade accuracy, irregular heartbeat detection, 60-memory storage.", category: { name: "Diagnostic Equipment" }, brand: "MedTech", isAvailable: true, stockQty: 25, sku: "BP-001" },
  { id: "2", name: "Fingertip Pulse Oximeter", slug: "fingertip-pulse-oximeter", price: 45.99, discountPrice: null, images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"], shortDesc: "Real-time SpO₂ and pulse rate with bright OLED display.", category: { name: "Diagnostic Equipment" }, brand: "OxyPro", isAvailable: true, stockQty: 50, sku: "OX-001" },
  { id: "3", name: "Infrared Forehead Thermometer", slug: "infrared-forehead-thermometer", price: 39.99, discountPrice: 29.99, images: ["https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=80"], shortDesc: "Non-contact 1-second readings for all ages.", category: { name: "Diagnostic Equipment" }, brand: "ThermoScan", isAvailable: true, stockQty: 75, sku: "TH-001" },
  { id: "4", name: "12-Lead ECG Machine", slug: "12-lead-ecg-machine", price: 1299.99, discountPrice: 999.99, images: ["https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&q=80"], shortDesc: "Hospital-grade ECG with wireless data transfer and AI analysis.", category: { name: "Patient Monitoring" }, brand: "CardioTech", isAvailable: true, stockQty: 8, sku: "ECG-001" },
  { id: "5", name: "Portable Ultrasound Scanner", slug: "portable-ultrasound-scanner", price: 4999.99, discountPrice: null, images: ["https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&q=80"], shortDesc: "WiFi-enabled handheld ultrasound with AI-assisted diagnostics.", category: { name: "Diagnostic Equipment" }, brand: "UltraScan", isAvailable: true, stockQty: 3, sku: "US-001" },
  { id: "6", name: "Multi-Parameter Patient Monitor", slug: "multi-parameter-patient-monitor", price: 2499.99, discountPrice: 1999.99, images: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&q=80"], shortDesc: "ECG, SpO₂, NIBP, temperature monitoring in one unit.", category: { name: "Patient Monitoring" }, brand: "VitalGuard", isAvailable: true, stockQty: 12, sku: "PM-001" },
  { id: "7", name: "Medical Mesh Nebulizer", slug: "medical-mesh-nebulizer", price: 79.99, discountPrice: 59.99, images: ["https://images.unsplash.com/photo-1631815590058-860e4d65b977?w=400&q=80"], shortDesc: "Silent mesh nebulizer, portable and rechargeable.", category: { name: "Home Healthcare" }, brand: "BreathEasy", isAvailable: true, stockQty: 30, sku: "NB-001" },
  { id: "8", name: "Hospital Bed with Rails", slug: "hospital-bed-with-rails", price: 3499.99, discountPrice: null, images: ["https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&q=80"], shortDesc: "Adjustable electric hospital bed with safety rails.", category: { name: "Hospital Furniture" }, brand: "ComfortCare", isAvailable: true, stockQty: 5, sku: "HB-001" },
  { id: "9", name: "Stethoscope Premium", slug: "stethoscope-premium", price: 149.99, discountPrice: 119.99, images: ["https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&q=80"], shortDesc: "Dual-head stethoscope with superior acoustics.", category: { name: "Diagnostic Equipment" }, brand: "CardioCare", isAvailable: true, stockQty: 40, sku: "ST-001" },
  { id: "10", name: "Glucometer Kit", slug: "glucometer-kit", price: 59.99, discountPrice: 44.99, images: ["https://images.unsplash.com/photo-1631815590058-860e4d65b977?w=400&q=80"], shortDesc: "Fast blood glucose monitoring with 50-test strips included.", category: { name: "Home Healthcare" }, brand: "GlucoSmart", isAvailable: true, stockQty: 60, sku: "GL-001" },
  { id: "11", name: "Portable Defibrillator AED", slug: "portable-defibrillator-aed", price: 1899.99, discountPrice: null, images: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&q=80"], shortDesc: "Automated external defibrillator with voice prompts.", category: { name: "Patient Monitoring" }, brand: "RescueTech", isAvailable: true, stockQty: 7, sku: "AED-001" },
  { id: "12", name: "Medical Oxygen Concentrator", slug: "medical-oxygen-concentrator", price: 799.99, discountPrice: 649.99, images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"], shortDesc: "5L/min portable oxygen concentrator for home use.", category: { name: "Home Healthcare" }, brand: "OxyGen", isAvailable: true, stockQty: 15, sku: "OC-001" },
];

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string; specialty?: string; sort?: string; featured?: string; q?: string; page?: string; inStock?: string }> }) {
  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const activeSpecialty =
    sp.specialty ?? (sp.category ? (DENTAL_CATEGORY_SLUGS.includes(sp.category) ? "dental" : "ophthalmology") : undefined);

  const where: Prisma.ProductWhereInput = {};
  if (sp.category) where.category = HIDDEN_CATEGORY_SLUGS.includes(sp.category) ? { slug: "__none__" } : { slug: sp.category };
  else if (sp.specialty === "dental") where.id = "__none__";
  else if (sp.specialty === "ophthalmology") where.category = { slug: { notIn: HIDDEN_CATEGORY_SLUGS } };
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

  const [dbProducts, categories, total] = await Promise.all([
    safeDb((db) => db.product.findMany({ where, orderBy, skip, take: ITEMS_PER_PAGE, select: { ...LISTING_PRODUCT_SELECT, category: true } })),
    safeDb((db) => db.category.findMany({ where: { isActive: true, slug: { notIn: HIDDEN_CATEGORY_SLUGS } }, orderBy: { name: "asc" } })),
    safeDb((db) => db.product.count({ where })),
  ]);

  const products = dbProducts ? dbProducts.map(withPublicPrice) : fallbackProducts;
  const totalPages = Math.ceil((total ?? fallbackProducts.length) / ITEMS_PER_PAGE);

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
