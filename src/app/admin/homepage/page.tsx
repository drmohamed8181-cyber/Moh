export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { safeDb } from "@/lib/prisma";
import HomepageManager from "@/components/admin/HomepageManager";

export const metadata: Metadata = { title: "Homepage Manager – Admin" };

export default async function HomepageAdminPage() {
  const slides = await safeDb((db) => db.heroSlide.findMany({ orderBy: { order: "asc" } })) ?? [];
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Homepage Manager</h1>
      <HomepageManager slides={slides} />
    </div>
  );
}
