"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MonitorPlay } from "lucide-react";
import { toast } from "sonner";

// One click puts a product on (or takes it off) the homepage hero slider.
export default function HeroProductToggle({ id, inHero, hasImage }: { id: string; inHero: boolean; hasImage: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    if (!hasImage) {
      toast.error("Add a photo to this product first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hero-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, show: !inHero }),
      });
      if (res.ok) {
        toast.success(inHero ? "Removed from the homepage slider" : "Added to the homepage slider");
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
      title={!hasImage ? "Add a photo first" : inHero ? "Click to remove from the homepage slider" : "Click to show in the homepage slider"}
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full whitespace-nowrap transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        inHero ? "bg-primary-600 text-white hover:bg-primary-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      <MonitorPlay size={11} />
      {inHero ? "On homepage" : "Homepage"}
    </button>
  );
}
