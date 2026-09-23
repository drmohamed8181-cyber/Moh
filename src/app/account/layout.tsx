import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { safeDb } from "@/lib/prisma";
import { getSearchCategoryLinks } from "@/lib/publicData";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const rows = (await safeDb((db) => db.siteSetting.findMany())) ?? [];
  const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  const categories = await getSearchCategoryLinks();

  return (
    <>
      <Header settings={settings} categories={categories} />
      <main className="min-h-screen bg-gray-50 py-10">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
