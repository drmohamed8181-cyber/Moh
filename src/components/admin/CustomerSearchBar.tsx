"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import SearchSuggestInput from "@/components/ui/SearchSuggestInput";

export type CustomerSuggestion = {
  id: string;
  name: string | null;
  email: string;
  organization: string | null;
  image: string | null;
};

const MAX_SUGGESTIONS = 8;

// Names starting with the typed text first, then a word in the name, then any
// name/email/organization match. -1 = no match.
function rank(c: CustomerSuggestion, q: string) {
  const name = (c.name ?? "").toLowerCase();
  if (name.startsWith(q)) return 0;
  if (name.split(/\s+/).some((w) => w.startsWith(q))) return 1;
  if (c.email.toLowerCase().startsWith(q)) return 2;
  if (c.organization?.toLowerCase().includes(q)) return 3;
  if (name.includes(q) || c.email.toLowerCase().includes(q)) return 4;
  return -1;
}

export default function CustomerSearchBar({ customers }: { customers: CustomerSuggestion[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initialQ);
  const lastPushed = useRef(initialQ);

  // Only resync from the URL when the change didn't originate from this component
  // (e.g. browser back/forward). Otherwise a slow round-trip from an earlier
  // keystroke can land after newer typing and stomp it.
  useEffect(() => {
    if (initialQ !== lastPushed.current) {
      setValue(initialQ);
      lastPushed.current = initialQ;
    }
  }, [initialQ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value === initialQ) return;
      const next = value.trim();
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set("q", next);
      else params.delete("q");
      lastPushed.current = next;
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return customers
      .map((c) => ({ c, r: rank(c, q) }))
      .filter((x) => x.r >= 0)
      .sort((a, b) => a.r - b.r || (a.c.name ?? a.c.email).localeCompare(b.c.name ?? b.c.email))
      .map((x) => x.c);
  }, [customers, value]);

  const suggestions = matches.slice(0, MAX_SUGGESTIONS).map((c) => ({
    id: c.id,
    title: c.name ?? c.email,
    subtitle: [c.email, c.organization].filter(Boolean).join(" · "),
    image: c.image,
    roundThumb: true,
    fallback: <span className="text-sm font-semibold text-blue-600">{(c.name ?? c.email)[0]?.toUpperCase()}</span>,
  }));

  // Picking a customer narrows the table to just them (emails are unique).
  const selectCustomer = (id: string) => {
    const c = customers.find((x) => x.id === id);
    if (!c) return;
    setValue(c.email);
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", c.email);
    lastPushed.current = c.email;
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = value.trim();
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("q", next);
    else params.delete("q");
    lastPushed.current = next;
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClear = () => {
    setValue("");
    lastPushed.current = "";
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-4">
      <SearchSuggestInput
        className="flex-1 max-w-md"
        value={value}
        onChange={setValue}
        suggestions={suggestions}
        onSelect={(s) => selectCustomer(s.id)}
        noun="customers"
        placeholder="Search name, email, organization, phone, address..."
      />
      <button type="submit" className="px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
        Search
      </button>
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1 px-3 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <X size={14} /> Clear
        </button>
      )}
    </form>
  );
}
