import { FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Catalog } from "@/lib/catalogs";
import type { CatalogLinkSource } from "@/lib/catalogDownloads";
import CatalogRequestLink from "@/components/shop/CatalogRequestLink";

// The PDF opens in a new tab so the visitor keeps their place in the shop.
// First-time visitors are asked for their name, email and clinic before it
// opens (see CatalogRequestLink). `source` says where the button sits, for
// the download counts.
export default function CatalogDownloadButton({
  catalog,
  source,
  label,
  variant = "outline",
  className,
}: {
  catalog: Catalog;
  source: CatalogLinkSource;
  label?: string;
  variant?: "outline" | "onDark";
  className?: string;
}) {
  return (
    <CatalogRequestLink
      catalog={catalog}
      source={source}
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
    </CatalogRequestLink>
  );
}
