"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SearchSuggestInput, { type SearchSuggestion } from "@/components/ui/SearchSuggestInput";

type ApiSuggestion = { id: string; name: string; slug: string; image: string | null; subtitle: string | null };

// Public product search with live suggestions, used in the header overlay and
// on the /search page. Picking a suggestion opens that product; Enter or the
// button goes to the full results page.
export default function SiteSearchBox({
  initialQuery = "",
  autoFocus,
  onNavigate,
  value: controlledValue,
  onValueChange,
}: {
  initialQuery?: string;
  autoFocus?: boolean;
  // Called after navigating away, e.g. to close the header overlay.
  onNavigate?: () => void;
  // Optional control from the parent (the header's "Popular" chips).
  value?: string;
  onValueChange?: (v: string) => void;
}) {
  const router = useRouter();
  const [ownValue, setOwnValue] = useState(initialQuery);
  const value = controlledValue ?? ownValue;
  const setValue = onValueChange ?? setOwnValue;

  const [results, setResults] = useState<{ q: string; items: ApiSuggestion[]; total: number }>({ q: "", items: [], total: 0 });
  const query = value.trim();
  const loading = query.length > 0 && results.q !== query;

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data: { suggestions: ApiSuggestion[]; total: number } = await res.json();
        setResults({ q: query, items: data.suggestions, total: data.total });
      } catch (err) {
        if ((err as Error).name !== "AbortError") setResults({ q: query, items: [], total: 0 });
      }
    }, 200);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const items = results.q === query ? results.items : [];
  const suggestions: SearchSuggestion[] = items.map((s) => ({ id: s.slug, title: s.name, subtitle: s.subtitle, image: s.image }));

  const goToResults = () => {
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    onNavigate?.();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        goToResults();
      }}
      className="flex gap-3"
    >
      <SearchSuggestInput
        className="flex-1"
        inputClassName="py-3"
        value={value}
        onChange={setValue}
        suggestions={suggestions}
        onSelect={(s) => {
          router.push(`/products/${s.id}`);
          onNavigate?.();
        }}
        totalMatches={results.q === query ? results.total : undefined}
        onShowAll={goToResults}
        loading={loading}
        autoFocus={autoFocus}
        noun="products"
        placeholder="Search products, categories, brands..."
      />
      <button type="submit" className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium">
        Search
      </button>
    </form>
  );
}
