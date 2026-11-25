"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, Trash2 } from "lucide-react";
import { PRICE_CONFIRM_ERROR, containsPrice } from "@/lib/priceGuard";

export default function SubmissionActions({ id, email, productName }: { id: string; email: string; productName: string }) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [priceConfirmed, setPriceConfirmed] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const hasPrice = containsPrice(reply);

  const sendReply = async () => {
    const text = reply.trim();
    if (!text) return toast.error("Write a reply message first.");
    if (hasPrice && !priceConfirmed) return toast.error(PRICE_CONFIRM_ERROR);
    setSending(true);
    try {
      const res = await fetch(`/api/admin/product-submissions/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: text, priceQuote: hasPrice }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(`Reply emailed to ${email}.`);
        setReply("");
        setPriceConfirmed(false);
        router.refresh();
      } else {
        toast.error(data.error ?? "Failed to send reply.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setSending(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/product-submissions/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Submission deleted.");
        router.push("/admin/product-submissions");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Failed to delete submission.");
        setDeleting(false);
      }
    } catch {
      toast.error("Network error.");
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border p-6 space-y-3">
        <h2 className="font-semibold text-gray-900">Reply to Seller</h2>
        <p className="text-xs text-gray-500">Emailed to {email}. Their answer goes to info@mpmedpharma.com. A copy is added to Internal Notes.</p>
        <label htmlFor="submission-reply" className="sr-only">Reply message</label>
        <textarea
          id="submission-reply"
          rows={6}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-y"
          placeholder={`Thank you for submitting your ${productName}...`}
        />
        {hasPrice && (
          <label className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 rounded-lg p-2.5">
            <input
              type="checkbox"
              checked={priceConfirmed}
              onChange={(e) => setPriceConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-amber-600"
            />
            <span>This reply includes a price or offer. Tick to confirm you want to send it.</span>
          </label>
        )}
        <button
          type="button"
          onClick={sendReply}
          disabled={sending || !reply.trim()}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          <Send size={15} /> {sending ? "Sending..." : "Send Reply"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-red-100 p-6 space-y-3">
        <h2 className="font-semibold text-gray-900">Delete Submission</h2>
        {confirmDelete ? (
          <>
            <p className="text-sm text-gray-600">This permanently deletes the submission and the seller&apos;s photos. It cannot be undone.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={remove}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50"
          >
            <Trash2 size={15} /> Delete Submission
          </button>
        )}
      </div>
    </>
  );
}
