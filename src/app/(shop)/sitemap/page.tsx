import { Metadata } from "next";
import Link from "next/link";
import { safeDb } from "@/lib/prisma";
import { HIDDEN_CATEGORY_SLUGS } from "@/lib/specialties";
import { getPublicBrands } from "@/lib/publicData";
import { GUIDES } from "@/content/guides";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sitemap",
  description: "A complete map of the pages available on the MP MedPharma website.",
  alternates: { canonical: "/sitemap" },
};

export default async function SitemapPage() {
  const [categories, brands] = await Promise.all([
    safeDb((db) => db.category.findMany({
      where: { isActive: true, slug: { notIn: HIDDEN_CATEGORY_SLUGS } },
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    })).then((rows) => rows ?? []),
    getPublicBrands().catch(() => []),
  ]);

  const sections: { title: string; links: { label: string; href: string }[] }[] = [
    {
      title: "Shop",
      links: [
        { label: "All Products", href: "/products" },
        { label: "Categories", href: "/categories" },
        { label: "Brands", href: "/brands" },
        { label: "Sell Your Product", href: "/sell-your-product" },
        { label: "Search", href: "/search" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Buying Guides",
      links: [
        { label: "All Guides", href: "/guides" },
        ...GUIDES.map((guide) => ({ label: guide.title, href: `/guides/${guide.slug}` })),
      ],
    },
    {
      title: "My Account",
      links: [
        { label: "Sign In", href: "/login" },
        { label: "Create Account", href: "/register" },
        { label: "My Orders", href: "/account/orders" },
        { label: "Wishlist", href: "/account/wishlist" },
        { label: "Addresses", href: "/account/addresses" },
        { label: "Settings", href: "/account/settings" },
      ],
    },
    {
      title: "Customer Service",
      links: [
        { label: "FAQ", href: "/faq" },
        { label: "Shipping Policy", href: "/shipping" },
        { label: "Return Policy", href: "/returns" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms & Conditions", href: "/terms" },
      ],
    },
  ];

  return (
    <div>
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sitemap</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">Every page on MP MedPharma, in one place</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="grid sm:grid-cols-2 gap-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{section.title}</h2>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-700 hover:text-primary-600 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Product Categories</h2>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/categories/${cat.slug}`} className="text-sm text-gray-700 hover:text-primary-600 transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {brands.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Brands</h2>
              <ul className="space-y-2.5">
                {brands.map((brand) => (
                  <li key={brand.slug}>
                    <Link href={`/brands/${brand.slug}`} className="text-sm text-gray-700 hover:text-primary-600 transition-colors">
                      {brand.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
