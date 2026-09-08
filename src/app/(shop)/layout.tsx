import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { getSiteSettings } from "@/lib/publicData";

// Deliberately not `force-dynamic`. This layout wraps the whole public shop, so
// forcing it dynamic forced every page under it — including all the product
// pages — to be rebuilt from the database on every request, crawler visits
// included. The settings read is cached and tag-invalidated instead; the
// per-visitor parts of the chrome (sign-in state, wishlist) live in Header,
// which is a client component and resolves in the browser.

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <Header settings={settings} />
      <main className="min-h-screen">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton />
    </>
  );
}
