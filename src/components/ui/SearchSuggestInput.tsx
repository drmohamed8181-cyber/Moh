"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { Search, Package, Loader2 } from "lucide-react";

export type SearchSuggestion = {
  id: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
  // Shown in the thumbnail slot when there is no image (e.g. an initial).
  fallback?: ReactNode;
  roundThumb?: boolean;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  suggestions: SearchSuggestion[];
  onSelect: (s: SearchSuggestion) => void;
  // How many results match in total; when larger than suggestions.length a
  // "Show all" row is added that calls onShowAll.
  totalMatches?: number;
  onShowAll?: () => void;
  loading?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  noun?: string;
  className?: string;
  inputClassName?: string;
};

// The search box with a live dropdown of matches used across the site. It
// only renders the input and dropdown; the parent owns the surrounding form,
// so Enter without a highlighted suggestion submits that form as usual.
export default function SearchSuggestInput({
  value,
  onChange,
  suggestions,
  onSelect,
  totalMatches,
  onShowAll,
  loading = false,
  placeholder,
  autoFocus,
  noun = "results",
  className = "",
  inputClassName = "py-2.5 text-sm",
}: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const choose = (s: SearchSuggestion) => {
    setOpen(false);
    onSelect(s);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && suggestions.length) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp" && suggestions.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (open && suggestions[active]) {
        e.preventDefault();
        choose(suggestions[active]);
      } else {
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const query = value.trim();
  const showDropdown = open && query.length > 0;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listId}
        aria-autocomplete="list"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full pl-9 pr-9 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 ${inputClassName}`}
      />
      {loading && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}

      {showDropdown && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden text-left">
          {suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">
              {loading ? "Searching…" : <>No {noun} match &ldquo;{query}&rdquo;</>}
            </p>
          ) : (
            <ul id={listId} role="listbox" className="max-h-96 overflow-y-auto divide-y">
              {suggestions.map((s, i) => (
                <li
                  key={s.id}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(s)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${i === active ? "bg-primary-50" : "hover:bg-gray-50"}`}
                >
                  <div className={`relative w-9 h-9 bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center ${s.roundThumb ? "rounded-full" : "rounded-lg"}`}>
                    {s.image ? (
                      <Image src={s.image} alt="" fill sizes="36px" className={s.roundThumb ? "object-cover" : "object-contain p-0.5"} />
                    ) : (
                      s.fallback ?? <Package size={16} className="text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.title}</p>
                    {s.subtitle && <p className="text-xs text-gray-400 truncate">{s.subtitle}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {onShowAll && totalMatches != null && totalMatches > suggestions.length && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onShowAll();
              }}
              className="w-full px-4 py-2 text-xs font-medium text-primary-600 bg-gray-50 hover:bg-gray-100 border-t text-left"
            >
              Show all {totalMatches} {noun}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
