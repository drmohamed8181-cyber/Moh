import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/content/guides";
import { jsonLdScript } from "@/lib/jsonLd";
import { SITE_URL } from "@/lib/seo";
import { ArrowRight, BookOpen } from "lucide-react";

// Pure static content: no database, prerendered at build.
export const metadata: Metadata = {
  title: "Buying Guides – Ophthalmic Equipment Advice",
  description:
    "Plain-language guides on buying and selling ophthalmic equipment: refurbished vs new, used excimer laser checklists, Alcon Centurion vs Infiniti, and how equipment is valued.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: GUIDES.map((guide, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/guides/${guide.slug}`,
      name: guide.title,
    })),
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(itemListJsonLd) }} />
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Buying Guides</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            The questions practices ask us before buying or selling ophthalmic equipment, answered in plain language.
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid sm:grid-cols-2 gap-6">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group bg-white rounded-2xl border p-6 hover:border-primary-200 hover:shadow-card-hover transition-all duration-300 flex flex-col"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors leading-snug">{guide.title}</h2>
              <p className="text-sm text-gray-600 mt-3 flex-1">{guide.description}</p>
              <span className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-primary-600">
                Read the guide <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
