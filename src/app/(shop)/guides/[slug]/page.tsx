import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuide } from "@/content/guides";
import { jsonLdScript } from "@/lib/jsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { ArrowRight, ChevronRight } from "lucide-react";

// Static article pages. Each guide is a search-intent landing page that links
// into the catalogue; see src/content/guides.ts for the content itself.

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${slug}` },
    openGraph: { type: "article", title: guide.title, description: guide.description, publishedTime: guide.publishedAt },
    twitter: { card: "summary", title: guide.title, description: guide.description },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const url = `${SITE_URL}/guides/${slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishedAt,
    dateModified: guide.publishedAt,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
      { "@type": "ListItem", position: 3, name: guide.title, item: url },
    ],
  };

  const otherGuides = GUIDES.filter((other) => other.slug !== slug);
  const published = new Date(guide.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd) }} />

      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-14">
        <div className="container mx-auto px-4 max-w-3xl">
          <nav className="flex items-center gap-2 text-blue-200 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/guides" className="hover:text-white transition-colors">Guides</Link>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{guide.title}</h1>
          <p className="text-blue-200 text-sm">
            By {SITE_NAME} · <time dateTime={guide.publishedAt}>{published}</time>
          </p>
        </div>
      </div>

      <article className="container mx-auto px-4 py-12 max-w-3xl">
        <p className="text-lg text-gray-700 leading-relaxed mb-10">{guide.intro}</p>

        {guide.sections.map((section) => (
          <section key={section.heading} className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-gray-700 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                {section.bullets.map((bullet) => (
                  <li key={bullet.slice(0, 40)}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <div className="mt-12 p-6 bg-primary-50 border border-primary-100 rounded-2xl">
          <h2 className="text-sm font-semibold text-primary-700 uppercase tracking-wider mb-4">Next steps</h2>
          <ul className="space-y-2">
            {guide.related.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex items-center gap-1.5 text-primary-700 font-medium hover:underline">
                  {link.label} <ArrowRight size={14} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {otherGuides.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">More guides</h2>
            <ul className="space-y-2.5">
              {otherGuides.map((other) => (
                <li key={other.slug}>
                  <Link href={`/guides/${other.slug}`} className="text-gray-700 hover:text-primary-600 transition-colors">
                    {other.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </div>
  );
}
