import type { Metadata } from "next";
import { safeDb } from "@/lib/prisma";
import { HIDDEN_CATEGORY_SLUGS } from "@/lib/specialties";
import { LISTING_PRODUCT_SELECT, withPublicPrice } from "@/lib/productSelect";
import { getPublicBrands } from "@/lib/publicData";
import HeroSlider from "@/components/shop/HeroSlider";
import CategoryGrid from "@/components/shop/CategoryGrid";
import SpecialtiesSection from "@/components/shop/SpecialtiesSection";
import FeaturedProducts from "@/components/shop/FeaturedProducts";
import HomeIntro from "@/components/shop/HomeIntro";
import AboutSection from "@/components/shop/AboutSection";
import NewsletterBox from "@/components/ui/NewsletterBox";
import { Truck, Shield, Award, Headphones } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { alternates: { canonical: "/" } };

async function getHomeData() {
  const [slides, categories, products, settingsRows, brands] = await Promise.all([
    safeDb((db) => db.heroSlide.findMany({ where: { isActive: true }, orderBy: { order: "asc" } })),
    safeDb((db) => db.category.findMany({ where: { isActive: true, slug: { notIn: HIDDEN_CATEGORY_SLUGS } }, orderBy: { name: "asc" }, take: 6, include: { _count: { select: { products: true } } } })),
    safeDb((db) => db.product.findMany({ where: { isFeatured: true, isAvailable: true, category: { slug: { notIn: HIDDEN_CATEGORY_SLUGS } } }, take: 8, orderBy: { createdAt: "desc" }, select: { ...LISTING_PRODUCT_SELECT, category: { select: { name: true, slug: true } } } })),
    safeDb((db) => db.siteSetting.findMany()),
    // Cached read; the brand strip is decoration, so a failure leaves it empty
    // rather than taking the homepage down.
    getPublicBrands().catch(() => []),
  ]);

  const s = Object.fromEntries((settingsRows ?? []).map((row) => [row.key, row.value]));

  return {
    slides: slides ?? [],
    categories: categories ?? [],
    products: (products ?? []).map(withPublicPrice),
    settings: s,
    brands,
  };
}

// Only claims the business actually makes elsewhere on the site (see /about
// and the equipment acquisition program). The template's "FDA & CE certified",
// "ISO 13485" and "24/7" lines were removed: buyers of capital equipment check.
const trustFeatures = [
  { icon: Shield, title: "Documented Service History", description: "Every unit ships with its service records" },
  { icon: Award, title: "Warranty on Every Unit", description: "New and certified refurbished equipment" },
  { icon: Headphones, title: "Private Demos", description: "See the unit running before you buy" },
  { icon: Truck, title: "We Buy Used Equipment", description: "Fair, transparent offers on the device you retire" },
];

export default async function HomePage() {
  const { slides, categories, products, settings, brands } = await getHomeData();

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

      <HomeIntro brands={brands} />
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
