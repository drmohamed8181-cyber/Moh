export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { safeDb } from "@/lib/prisma";
import HomepageManager from "@/components/admin/HomepageManager";
import HeroProductsManager from "@/components/admin/HeroProductsManager";
import { HIDDEN_CATEGORY_SLUGS } from "@/lib/specialties";
import { HERO_PRODUCTS_KEY, parseHeroProductIds } from "@/lib/heroProducts";

export const metadata: Metadata = { title: "Homepage Manager – Admin" };

export default async function HomepageAdminPage() {
  const [slides, products, heroSetting] = await Promise.all([
    safeDb((db) => db.heroSlide.findMany({ orderBy: { order: "asc" } })),
    // Products a slide can showcase: only ones visitors can actually open.
    safeDb((db) => db.product.findMany({
      where: { isAvailable: true, category: { slug: { notIn: HIDDEN_CATEGORY_SLUGS } } },
      select: { id: true, name: true, slug: true, sku: true, shortDesc: true, images: true, category: { select: { name: true } } },
      orderBy: { name: "asc" },
    })),
    safeDb((db) => db.siteSetting.findUnique({ where: { key: HERO_PRODUCTS_KEY } })),
  ]);
  const byId = new Map((products ?? []).map((p) => [p.id, p]));
  const heroProducts = parseHeroProductIds(heroSetting?.value).flatMap((id) => {
    const p = byId.get(id);
    return p ? [{ id: p.id, name: p.name, image: p.images[0] ?? null }] : [];
  });
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Homepage Manager</h1>
      <HeroProductsManager products={heroProducts} />
      <HomepageManager slides={slides ?? []} products={products ?? []} />
    </div>
  );
}
