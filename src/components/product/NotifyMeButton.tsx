"use client";

import { useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";

// "Notify me when available" on sold or unavailable products. Opens a short
// form; the request goes to /api/stock-alert and the email is sent once, by
// the daily cron, when the unit is listed again.
export default function NotifyMeButton({
  productId,
  productName,
  defaultEmail,
  defaultName,
}: {
  productId: string;
  productName: string;
  defaultEmail?: string | null;
  defaultName?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [name, setName] = useState(defaultName ?? "");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/stock-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email, name, phone, organization }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl p-4 mb-5">
        <CheckCircle2 size={16} /> Done. We&apos;ll email you once when the {productName} is available again.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 mb-5 rounded-xl font-semibold border-2 border-primary-600 text-primary-700 hover:bg-primary-50 transition-colors"
      >
        <Bell size={18} /> Notify me when available
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mb-5 p-4 rounded-xl border border-gray-200 bg-white space-y-3" aria-label="Notify me when available">
      <p className="text-sm text-gray-700">We&apos;ll email you once when this unit is available again. No other emails.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm text-gray-700">
          <span className="block mb-1">Full name</span>
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="text-sm text-gray-700">
          <span className="block mb-1">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="text-sm text-gray-700">
          <span className="block mb-1">Phone</span>
          <input
            type="tel"
            required
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="text-sm text-gray-700">
          <span className="block mb-1">Clinic or hospital</span>
          <input
            type="text"
            required
            autoComplete="organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
      </div>
      {status === "error" && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={status === "sending"}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
        >
          <Bell size={16} /> {status === "sending" ? "Saving…" : "Notify me"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700">
          Cancel
        </button>
      </div>
      <p className="text-xs text-gray-500">
        See our <a href="/privacy" className="underline">privacy policy</a>. Every email has a link to cancel.
      </p>
    </form>
  );
}
