import { FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Catalog } from "@/lib/catalogs";

// A plain <a>, not next/link: the target is a PDF from a route handler, not a
// page. It opens in a new tab so the visitor keeps their place in the shop.
export default function CatalogDownloadButton({
  catalog,
  label,
  variant = "outline",
  className,
}: {
  catalog: Catalog;
  label?: string;
  variant?: "outline" | "onDark";
  className?: string;
}) {
  return (
    <a
      href={catalog.href}
      target="_blank"
      rel="noopener"
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        variant === "onDark"
          ? "bg-white/10 text-white border border-white/30 hover:bg-white/20 focus-visible:outline-white"
          : "bg-white text-primary-700 border border-primary-200 hover:border-primary-400 hover:bg-primary-50 focus-visible:outline-primary-600",
        className
      )}
    >
      <FileDown size={16} aria-hidden="true" />
      {label ?? `${catalog.name} catalog (PDF)`}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
