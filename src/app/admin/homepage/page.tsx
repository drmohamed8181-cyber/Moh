export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { safeDb } from "@/lib/prisma";
import HomepageManager from "@/components/admin/HomepageManager";
import { HIDDEN_CATEGORY_SLUGS } from "@/lib/specialties";

export const metadata: Metadata = { title: "Homepage Manager – Admin" };

export default async function HomepageAdminPage() {
  const [slides, products] = await Promise.all([
    safeDb((db) => db.heroSlide.findMany({ orderBy: { order: "asc" } })),
    // Products a slide can showcase: only ones visitors can actually open.
    safeDb((db) => db.product.findMany({
      where: { isAvailable: true, category: { slug: { notIn: HIDDEN_CATEGORY_SLUGS } } },
      select: { id: true, name: true, slug: true, sku: true, shortDesc: true, images: true, category: { select: { name: true } } },
      orderBy: { name: "asc" },
    })),
  ]);
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Homepage Manager</h1>
      <HomepageManager slides={slides ?? []} products={products ?? []} />
    </div>
  );
}
