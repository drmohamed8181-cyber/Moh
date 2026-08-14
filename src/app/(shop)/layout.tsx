import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { safeDb } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const rows = (await safeDb((db) => db.siteSetting.findMany())) ?? [];
  const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  return (
    <>
      <Header settings={settings} />
      <main className="min-h-screen">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton />
    </>
  );
}
