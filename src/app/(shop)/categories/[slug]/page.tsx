export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { safeDb } from "@/lib/prisma";
import { HIDDEN_CATEGORY_SLUGS } from "@/lib/specialties";
import { LISTING_PRODUCT_SELECT, withPublicPrice } from "@/lib/productSelect";
import ProductCard from "@/components/product/ProductCard";
import { ChevronRight } from "lucide-react";

const defaultCategories: Record<string, { name: string; description: string; image: string }> = {
  "patient-monitoring": { name: "Patient Monitoring", description: "ECG monitors, patient monitors, vital signs equipment", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&q=80" },
  "diagnostic-equipment": { name: "Diagnostic Equipment", description: "Blood pressure monitors, stethoscopes, diagnostic tools", image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80" },
  "laboratory-equipment": { name: "Laboratory Equipment", description: "Lab analyzers, centrifuges, microscopes", image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80" },
  "surgical-instruments": { name: "Surgical Instruments", description: "Scalpels, forceps, retractors, surgical sets", image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&q=80" },
  "hospital-furniture": { name: "Hospital Furniture", description: "Hospital beds, stretchers, medical carts", image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80" },
  "home-healthcare": { name: "Home Healthcare", description: "Nebulizers, CPAP machines, home monitors", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80" },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await safeDb((db) => db.category.findUnique({ where: { slug } }));
  const name = cat?.name ?? defaultCategories[slug]?.name ?? "Category";
  const description = cat?.description ?? defaultCategories[slug]?.description;
  const rawImage = cat?.image ?? defaultCategories[slug]?.image;
  const image = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `https://www.mpmedpharma.com${rawImage}`
    : undefined;
  return {
    title: name,
    description,
    alternates: { canonical: `/categories/${slug}` },
    openGraph: {
      type: "website",
      title: name,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: name,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (HIDDEN_CATEGORY_SLUGS.includes(slug)) notFound();

  const [dbCategory, dbProducts] = await Promise.all([
    safeDb((db) => db.category.findUnique({ where: { slug } })),
    safeDb((db) => db.product.findMany({
      where: { category: { slug }, isAvailable: true },
      orderBy: { isFeatured: "desc" },
      select: { ...LISTING_PRODUCT_SELECT, category: true },
    })),
  ]);

  const fallback = defaultCategories[slug];
  const category = dbCategory ?? (fallback ? { id: slug, name: fallback.name, description: fallback.description, slug, image: fallback.image } : null);

  if (!category) notFound();

  const products = (dbProducts ?? []).map(withPublicPrice);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.mpmedpharma.com/" },
      { "@type": "ListItem", position: 2, name: "Categories", item: "https://www.mpmedpharma.com/categories" },
      { "@type": "ListItem", position: 3, name: category.name, item: `https://www.mpmedpharma.com/categories/${slug}` },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.mpmedpharma.com/products/${product.slug}`,
      name: product.name,
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-14">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-blue-200 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
            <ChevronRight size={14} />
            <span className="text-white">{category.name}</span>
          </nav>
          <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
          {category.description && <p className="text-blue-100 text-lg">{category.description}</p>}
          <p className="text-blue-200 text-sm mt-3">{products.length} product{products.length !== 1 ? "s" : ""} available</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-2">No products found in this category yet.</p>
            <Link href="/products" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
