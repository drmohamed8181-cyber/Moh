"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const STATUSES = ["NEW", "REVIEWING", "ACCEPTED", "DECLINED"];

export default function SubmissionStatusControl({ id, status, adminNotes }: { id: string; status: string; adminNotes: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [notes, setNotes] = useState(adminNotes ?? "");
  const [saving, setSaving] = useState(false);

  const save = async (nextStatus: string, nextNotes: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/product-submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, adminNotes: nextNotes }),
      });
      if (res.ok) {
        toast.success("Submission updated");
        router.refresh();
      } else {
        toast.error("Failed to update submission");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border p-6 space-y-4">
      <h2 className="font-semibold text-gray-900">Review Status</h2>
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
        <select
          value={value}
          onChange={(e) => { setValue(e.target.value); save(e.target.value, notes); }}
          disabled={saving}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Internal Notes</label>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => save(value, notes)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
          placeholder="Notes visible to admin staff only..."
        />
      </div>
    </div>
  );
}
