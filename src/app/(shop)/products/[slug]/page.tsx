export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { safeDb } from "@/lib/prisma";
import { HIDDEN_CATEGORY_SLUGS } from "@/lib/specialties";
import { LISTING_PRODUCT_SELECT, withPublicPrice } from "@/lib/productSelect";
import ProductDetail from "@/components/product/ProductDetail";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await safeDb((db) => db.product.findUnique({ where: { slug }, include: { category: true } }));
  if (!product || HIDDEN_CATEGORY_SLUGS.includes(product.category.slug)) return { title: "Product" };
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDesc ?? product.shortDesc ?? undefined,
    alternates: { canonical: `/products/${slug}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const dbProduct = await safeDb((db) => db.product.findUnique({
    where: { slug },
    select: { ...LISTING_PRODUCT_SELECT, category: true },
  }));

  if (dbProduct && HIDDEN_CATEGORY_SLUGS.includes(dbProduct.category.slug)) notFound();

  const product = dbProduct
    ? { ...withPublicPrice(dbProduct), specifications: dbProduct.specifications as Record<string, string> | null }
    : {
    id: "demo",
    name: "Digital Blood Pressure Monitor Pro",
    slug,
    sku: "BP-001",
    price: 89.99,
    discountPrice: 69.99,
    images: [
      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80",
    ],
    shortDesc: "Clinical-grade accuracy with instant readings, 60-memory storage, and irregular heartbeat detection.",
    description: "The Digital Blood Pressure Monitor Pro delivers hospital-grade accuracy in a compact, user-friendly design. With its advanced oscillometric measurement technology, it provides precise systolic and diastolic readings along with pulse rate in under 30 seconds.\n\nKey highlights include a large, easy-to-read LCD display, 60-reading memory with date and time stamps, irregular heartbeat detection (IHB), and a WHO classification indicator.",
    specifications: {
      "Measurement Method": "Oscillometric",
      "Measurement Range": "0–299 mmHg",
      "Accuracy": "±2 mmHg",
      "Pulse Rate Range": "40–180 bpm",
      "Memory": "60 readings",
      "Cuff Size": "22–42 cm",
      "Power": "4 × AA batteries or AC adapter",
      "Display": "Large LCD with backlight",
      "Dimensions": "125 × 90 × 70 mm",
      "Weight": "260g",
    },
    features: [
      "WHO blood pressure classification indicator",
      "Irregular heartbeat detection (IHB)",
      "Morning hypertension detection",
      "60-reading memory with timestamps",
      "Adjustable arm cuff included",
      "Auto power-off after 3 minutes",
    ],
    accessories: ["Adjustable arm cuff", "4 × AA batteries", "Carrying case", "User manual"],
    indications: ["Home blood pressure monitoring", "Routine hypertension screening"],
    clinicalEvidence: [],
    isAvailable: true,
    stockQty: 25,
    brand: "MedTech Pro",
    manufacturer: "MedTech International",
    warranty: "2 Years",
    weight: 0.26,
    dimensions: "125 × 90 × 70 mm",
    category: { name: "Diagnostic Equipment", slug: "diagnostic-equipment" },
    isFeatured: true,
  };

  return <ProductDetail product={product} />;
}
