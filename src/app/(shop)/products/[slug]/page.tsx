import { Metadata } from "next";
import { notFound } from "next/navigation";
import { HIDDEN_CATEGORY_SLUGS } from "@/lib/specialties";
import { getProductBySlug, getRelatedProducts, getPublicProductSlugs } from "@/lib/publicData";
import { jsonLdScript } from "@/lib/jsonLd";
import { productDescription, productTitle } from "@/lib/seo";
import ProductDetail from "@/components/product/ProductDetail";
import ProductCard from "@/components/product/ProductCard";

// Product pages are the same for every visitor, so they are prerendered and
// served from the ISR cache rather than rebuilt per request. Admin edits
// invalidate them immediately via revalidateTag(PRODUCTS_TAG, { expire: 0 });
// this TTL is only a backstop. See src/lib/publicData.ts.
export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

// Prerender the known catalogue at build time so the first crawler hit is
// already warm. dynamicParams stays at its default (true), so a product added
// after the last deploy still renders on demand and is cached from then on.
export async function generateStaticParams() {
  const slugs = await getPublicProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || HIDDEN_CATEGORY_SLUGS.includes(product.category.slug)) notFound();
  // Brand + model + purchase intent, not the bare product name — see src/lib/seo.ts.
  const title = productTitle(product);
  const description = productDescription(product);
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
  const dbProduct = await getProductBySlug(slug);

  if (!dbProduct || HIDDEN_CATEGORY_SLUGS.includes(dbProduct.category.slug)) notFound();

  // A failure here must not take down the whole page: the related rail is
  // decoration, and before caching was introduced this query failing still left
  // the product itself rendering fine.
  const dbRelatedProducts = await getRelatedProducts(dbProduct.categoryId, dbProduct.id).catch(() => []);
  const relatedProducts = dbRelatedProducts ?? [];

  // Already stripped of confidential pricing inside the cache boundary.
  const product = { ...dbProduct, specifications: dbProduct.specifications as Record<string, string> | null };

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
