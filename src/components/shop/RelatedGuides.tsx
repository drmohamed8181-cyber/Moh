import Link from "next/link";
import { BookOpen } from "lucide-react";
import { guidesLinkingTo } from "@/content/guides";

// "Buying guides" block for product, category and brand pages. Renders nothing
// when no guide links to any of the given pages.
export default function RelatedGuides({ paths, className }: { paths: string[]; className?: string }) {
  const guides = guidesLinkingTo(paths);
  if (guides.length === 0) return null;

  return (
    <section className={className} aria-labelledby="related-guides-heading">
      <h2 id="related-guides-heading" className="text-xl font-bold text-gray-900 mb-6">
        Buying guides
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={`/guides/${guide.slug}`}
              className="flex h-full flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5 hover:border-primary-300 hover:shadow-sm transition"
            >
              <BookOpen className="h-5 w-5 text-primary-600" aria-hidden="true" />
              <span className="font-semibold text-gray-900">{guide.title}</span>
              <span className="text-sm text-gray-600">{guide.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
