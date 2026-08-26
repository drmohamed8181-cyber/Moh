export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { safeDb } from "@/lib/prisma";
import { HIDDEN_CATEGORY_SLUGS } from "@/lib/specialties";
import { LISTING_PRODUCT_SELECT, withPublicPrice } from "@/lib/productSelect";
import { jsonLdScript } from "@/lib/jsonLd";
import ProductDetail from "@/components/product/ProductDetail";
import ProductCard from "@/components/product/ProductCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await safeDb((db) => db.product.findUnique({ where: { slug }, include: { category: true } }));
  if (!product || HIDDEN_CATEGORY_SLUGS.includes(product.category.slug)) notFound();
  const title = product.seoTitle ?? product.name;
  const description = product.seoDesc ?? product.shortDesc ?? undefined;
  const image = product.images[0]
    ? product.images[0].startsWith("http")
      ? product.images[0]
      : `https://www.mpmedpharma.com${product.images[0]}`
    : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const dbProduct = await safeDb((db) => db.product.findUnique({
    where: { slug },
    select: { ...LISTING_PRODUCT_SELECT, category: true },
  }));

  if (!dbProduct || HIDDEN_CATEGORY_SLUGS.includes(dbProduct.category.slug)) notFound();

  const dbRelatedProducts = await safeDb((db) => db.product.findMany({
    where: { categoryId: dbProduct.categoryId, id: { not: dbProduct.id }, isAvailable: true },
    orderBy: { isFeatured: "desc" },
    take: 4,
    select: { ...LISTING_PRODUCT_SELECT, category: true },
  }));
  const relatedProducts = (dbRelatedProducts ?? []).map(withPublicPrice);

  const product = { ...withPublicPrice(dbProduct), specifications: dbProduct.specifications as Record<string, string> | null };

  const publicPrice = product.publicPrice;

  // Google requires a Product to carry at least one of offers/review/aggregateRating.
  // Quote-only products (no public price, no reviews) can satisfy none of the three,
  // so we omit Product markup for them entirely rather than emit an incomplete one.
  const productJsonLd =
    publicPrice != null
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          sku: product.sku,
          description: product.shortDesc ?? product.description ?? undefined,
          image: product.images.map((img) =>
            img.startsWith("http") ? img : `https://www.mpmedpharma.com${img}`
          ),
          ...(product.category ? { category: product.category.name } : {}),
          ...(product.manufacturer ? { brand: { "@type": "Brand", name: product.manufacturer } } : {}),
          offers: {
            "@type": "Offer",
            url: `https://www.mpmedpharma.com/products/${slug}`,
            priceCurrency: "USD",
            price: publicPrice,
            availability: product.isAvailable
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            seller: { "@type": "Organization", name: "MP MedPharma" },
          },
        }
      : null;

  const breadcrumbItems = [
    { name: "Home", url: "https://www.mpmedpharma.com/" },
    { name: "Products", url: "https://www.mpmedpharma.com/products" },
    ...(product.category
      ? [{ name: product.category.name, url: `https://www.mpmedpharma.com/categories/${product.category.slug}` }]
      : []),
    { name: product.name, url: `https://www.mpmedpharma.com/products/${slug}` },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(productJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd) }}
      />
      <ProductDetail product={product} />
      {relatedProducts.length > 0 && (
        <div className="bg-white border-t">
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Equipment</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
