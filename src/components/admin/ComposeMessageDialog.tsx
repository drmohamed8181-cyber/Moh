"use client";

import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Mail, PenSquare, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComposeRecipient = { name: string | null; email: string };

export type SentMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";
const labelClass = "block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5";

/**
 * "New message" button and dialog. Sends an email to a customer (or any address) and saves it
 * on the Messages page. Pass `to` to write to one customer; otherwise `customers` fills the picker.
 */
export default function ComposeMessageDialog({
  to,
  customers = [],
  onSent,
  variant = "button",
}: {
  to?: ComposeRecipient;
  customers?: ComposeRecipient[];
  onSent?: (message: SentMessage) => void;
  variant?: "button" | "link";
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(to?.email ?? "");
  const [name, setName] = useState(to?.name ?? "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    firstFieldRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Picking a known customer's email fills in their name.
  const handleEmailChange = (value: string) => {
    setEmail(value);
    const match = customers.find((c) => c.email.toLowerCase() === value.trim().toLowerCase());
    if (match?.name) setName(match.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, subject, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Failed to send the message.");
        return;
      }
      toast.success(data.saved ? `Email sent to ${email.trim()}.` : `Email sent to ${email.trim()}, but it could not be saved to Messages.`);
      if (data.message) onSent?.({ ...data.message, createdAt: new Date(data.message.createdAt).toISOString() });
      setSubject("");
      setMessage("");
      if (!to) {
        setEmail("");
        setName("");
      }
      close();
    } catch {
      toast.error("Network error.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={to ? `Email ${to.name || to.email}` : undefined}
        className={cn(
          variant === "button"
            ? "flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            : "flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded",
        )}
      >
        {variant === "button" ? <PenSquare size={16} /> : <Mail size={12} />}
        {variant === "button" ? "New message" : "Email"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-title`}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-left"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 id={`${id}-title`} className="font-semibold text-slate-900">
                {to ? `Email ${to.name || to.email}` : "New message"}
              </h2>
              <button type="button" onClick={close} aria-label="Close" className="p-1 rounded-lg text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor={`${id}-email`} className={labelClass}>To (email)</label>
                <input
                  ref={to ? undefined : firstFieldRef}
                  id={`${id}-email`}
                  type="email"
                  required
                  value={email}
                  readOnly={Boolean(to)}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  list={to ? undefined : `${id}-customers`}
                  autoComplete="off"
                  placeholder="customer@example.com"
                  className={cn(inputClass, to && "bg-slate-50 text-slate-600")}
                />
                {!to && (
                  <datalist id={`${id}-customers`}>
                    {customers.map((c) => (
                      <option key={c.email} value={c.email}>{c.name ?? c.email}</option>
                    ))}
                  </datalist>
                )}
                {!to && <p className="text-xs text-slate-400 mt-1">Start typing to pick a customer, or enter a new email address.</p>}
              </div>

              {!to && (
                <div>
                  <label htmlFor={`${id}-name`} className={labelClass}>Name (optional)</label>
                  <input
                    id={`${id}-name`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="off"
                    className={inputClass}
                  />
                </div>
              )}

              <div>
                <label htmlFor={`${id}-subject`} className={labelClass}>Subject</label>
                <input
                  ref={to ? firstFieldRef : undefined}
                  id={`${id}-subject`}
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={`${id}-message`} className={labelClass}>Message</label>
                <textarea
                  id={`${id}-message`}
                  required
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={cn(inputClass, "resize-y")}
                />
                <p className="text-xs text-slate-400 mt-1">Signed &ldquo;— MP MedPharma&rdquo;. A copy is saved on the Messages page.</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={close}
                  className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Send size={14} />
                  {sending ? "Sending..." : "Send email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
