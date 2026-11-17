"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Send, Loader2 } from "lucide-react";

type Info = { campaign: { id: string; title: string }; eligible: number; optedOut: number; sent: number; pending: number; subject: string; html: string };

export default function AdminNewsletterPage() {
  const [info, setInfo] = useState<Info | null>(null);
  const [busy, setBusy] = useState<"" | "test" | "send">("");
  const [progress, setProgress] = useState("");

  const load = () =>
    fetch("/api/admin/newsletter")
      .then((r) => r.json())
      .then((d) => (d.error ? toast.error(d.error) : setInfo(d)));

  useEffect(() => {
    load();
  }, []);

  const sendTest = async () => {
    setBusy("test");
    const res = await fetch("/api/admin/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "test" }) });
    const d = await res.json().catch(() => ({}));
    setBusy("");
    if (res.ok) toast.success("Test sent to info@mpmedpharma.com");
    else toast.error(d.error || "Test failed");
  };

  const sendAll = async () => {
    if (!info) return;
    if (!window.confirm(`Send "${info.subject}" to ${info.pending} customers now? This cannot be undone.`)) return;
    setBusy("send");
    let total = 0;
    for (;;) {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", confirm: info.campaign.id }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(d.error || "Sending stopped");
        break;
      }
      total += d.sent;
      setProgress(`Sent ${total}. ${d.remaining} remaining${d.failed ? `, ${d.failed} failed in the last batch` : ""}.`);
      if (d.remaining === 0 || d.sent === 0) break;
    }
    setBusy("");
    toast.success(`Newsletter sent to ${total} customers`);
    load();
  };

  if (!info) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1"><Mail size={22} /> Newsletter</h1>
      <p className="text-gray-500 mb-6">{info.campaign.title} · subject: {info.subject}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          ["Will receive", info.pending],
          ["Already sent", info.sent],
          ["Unsubscribed", info.optedOut],
          ["All contacts", info.eligible + info.optedOut],
        ].map(([label, value]) => (
          <div key={label as string} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-3">
        <button onClick={sendTest} disabled={!!busy} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white font-medium disabled:opacity-50">
          {busy === "test" ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />} Send test to info@
        </button>
        <button onClick={sendAll} disabled={!!busy || info.pending === 0} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 text-white font-semibold disabled:opacity-50">
          {busy === "send" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Send to {info.pending} customers
        </button>
      </div>
      {progress && <p role="status" className="text-sm text-gray-700 mb-3">{progress}</p>}
      <p className="text-xs text-gray-500 mb-6">
        Includes everyone who registered, sent an inquiry or subscribed, except unsubscribed and internal addresses. Each person gets it once.
        Every email has an unsubscribe link and your postal address, and no prices.
      </p>

      <iframe title="Newsletter preview" srcDoc={info.html} className="w-full h-[900px] bg-white rounded-xl border border-gray-200" />
    </div>
  );
}
