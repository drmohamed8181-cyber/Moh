"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const HAS_ORDERS = "Customers with orders can't be deleted. Edit them and uncheck Active to disable them instead.";

/** Delete a customer after confirming. Disabled for customers with orders, so order records stay intact. */
export default function CustomerDeleteButton({
  customer,
  variant = "link",
  onDeleted,
}: {
  customer: { id: string; name: string | null; email: string; orderCount: number };
  variant?: "link" | "button";
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const label = customer.name || customer.email;
  const hasOrders = customer.orderCount > 0;

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${label}? This can't be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`${label} deleted`);
        onDeleted?.();
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Failed to delete customer");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting || hasOrders}
      title={hasOrders ? HAS_ORDERS : undefined}
      aria-label={`Delete ${label}`}
      className={cn(
        "flex items-center gap-1 font-medium text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-40 disabled:cursor-not-allowed",
        variant === "link" ? "text-xs rounded" : "gap-1.5 px-3 py-2.5 text-sm rounded-xl",
      )}
    >
      <Trash2 size={variant === "link" ? 12 : 14} />
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}
