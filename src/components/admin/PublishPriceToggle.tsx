"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface Props {
  id: string;
  published: boolean;
  hasPrice: boolean;
}

export default function PublishPriceToggle({ id, published, hasPrice }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    if (!hasPrice) {
      toast.error("Set an end-user price on this product first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retailPricePublic: !published }),
      });
      if (res.ok) {
        toast.success(published ? "Price hidden from public page" : "Price published to public page");
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
      disabled={loading || !hasPrice}
      title={!hasPrice ? "Set an end-user price first" : published ? "Click to hide from public page" : "Click to publish on public page"}
      className={`mt-1 inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        published
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      {published ? <Eye size={11} /> : <EyeOff size={11} />}
      {published ? "Published" : "Hidden"}
    </button>
  );
}
