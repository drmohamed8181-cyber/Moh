"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stamp } from "lucide-react";
import { toast } from "sonner";

async function setWatermark(productIds: string[], on: boolean) {
  const res = await fetch("/api/admin/watermark-products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productIds, on }),
  });
  return res.ok;
}

// One click turns the logo stamp on (or off) for a product's photos.
export default function WatermarkToggle({ id, on, hasImage, looksOfficial }: { id: string; on: boolean; hasImage: boolean; looksOfficial: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    if (!on && looksOfficial && !confirm("This product's photos look like official manufacturer photos. Only stamp them if you have permission to modify them. Stamp anyway?")) {
      return;
    }
    setLoading(true);
    try {
      if (await setWatermark([id], !on)) {
        toast.success(on ? "Logo stamp removed" : "Logo stamp added");
        router.refresh();
      } else {
        toast.error("Failed to update");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading || !hasImage}
      title={!hasImage ? "Add a photo first" : on ? "Click to remove the logo stamp from this product's photos" : "Click to stamp the logo on this product's photos"}
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full whitespace-nowrap transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        on ? "bg-primary-600 text-white hover:bg-primary-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      <Stamp size={11} />
      {on ? "Logo on" : "Logo"}
      {looksOfficial && !on && <span className="text-amber-600" aria-label="official photo">!</span>}
    </button>
  );
}

// Stamps every product in the list at once. Products with official
// manufacturer photos are left out; they can still be stamped one by one.
export function StampAllButton({ productIds, skipped }: { productIds: string[]; skipped: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    const note = skipped > 0 ? `\n\n${skipped} product${skipped === 1 ? " is" : "s are"} left out because the photos look like official manufacturer photos.` : "";
    if (!confirm(`Stamp the MP MedPharma logo on the photos of ${productIds.length} product${productIds.length === 1 ? "" : "s"}?${note}`)) return;
    setLoading(true);
    try {
      if (await setWatermark(productIds, true)) {
        toast.success(`Logo stamp added to ${productIds.length} product${productIds.length === 1 ? "" : "s"}`);
        router.refresh();
      } else {
        toast.error("Failed to update");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || productIds.length === 0}
      className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Stamp size={16} /> {productIds.length === 0 ? "All photos stamped" : `Stamp logo on ${productIds.length}`}
    </button>
  );
}
