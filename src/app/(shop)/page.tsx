import type { Metadata } from "next";
import { safeDb } from "@/lib/prisma";
import { HIDDEN_CATEGORY_SLUGS } from "@/lib/specialties";
import { LISTING_PRODUCT_SELECT, withPublicPrice } from "@/lib/productSelect";
import HeroSlider from "@/components/shop/HeroSlider";
import CategoryGrid from "@/components/shop/CategoryGrid";
import SpecialtiesSection from "@/components/shop/SpecialtiesSection";
import FeaturedProducts from "@/components/shop/FeaturedProducts";
import AboutSection from "@/components/shop/AboutSection";
import NewsletterBox from "@/components/ui/NewsletterBox";
import { Truck, Shield, Award, Headphones } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { alternates: { canonical: "/" } };

async function getHomeData() {
  const [slides, categories, products, settingsRows] = await Promise.all([
    safeDb((db) => db.heroSlide.findMany({ where: { isActive: true }, orderBy: { order: "asc" } })),
    safeDb((db) => db.category.findMany({ where: { isActive: true, slug: { notIn: HIDDEN_CATEGORY_SLUGS } }, orderBy: { name: "asc" }, take: 6, include: { _count: { select: { products: true } } } })),
    safeDb((db) => db.product.findMany({ where: { isFeatured: true, isAvailable: true, category: { slug: { notIn: HIDDEN_CATEGORY_SLUGS } } }, take: 8, orderBy: { createdAt: "desc" }, select: { ...LISTING_PRODUCT_SELECT, category: { select: { name: true, slug: true } } } })),
    safeDb((db) => db.siteSetting.findMany()),
  ]);

  const s = Object.fromEntries((settingsRows ?? []).map((row) => [row.key, row.value]));

  return {
    slides: slides ?? [],
    categories: categories ?? [],
    products: (products ?? []).map(withPublicPrice),
    settings: s,
  };
}

const trustFeatures = [
  { icon: Truck, title: "Fast Delivery", description: "Same-day dispatch on orders before 2 PM" },
  { icon: Shield, title: "Certified Products", description: "All equipment is FDA & CE certified" },
  { icon: Award, title: "Quality Guaranteed", description: "ISO 13485 quality management system" },
  { icon: Headphones, title: "Expert Support", description: "Clinical support team available 24/7" },
];

export default async function HomePage() {
  const { slides, categories, products, settings } = await getHomeData();

  const heroSlides = slides.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description ?? "",
    image: s.image,
    buttonText: s.buttonText ?? "Learn More",
    buttonLink: s.buttonLink ?? "/products",
  }));

  return (
    <>
      <HeroSlider slides={heroSlides} />

      {/* Trust bar */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustFeatures.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{title}</p>
                  <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SpecialtiesSection />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={products} />
      <AboutSection
        title={settings.aboutTitle}
        description={settings.aboutDescription}
        image={settings.aboutImage}
      />

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <NewsletterBox />
        </div>
      </section>
    </>
  );
}
