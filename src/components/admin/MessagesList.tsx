"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Mail, MailOpen, MessageSquare, Send, ChevronDown, CheckCircle2, Copy, ExternalLink, Trash2, UserRound, AlarmClock, Forward } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { DAY_MS, FOLLOW_UP_DAYS } from "@/lib/leads";
import ComposeMessageDialog, { type ComposeRecipient, type SentMessage } from "@/components/admin/ComposeMessageDialog";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  organization: string | null;
  address: string | null;
  workLocation: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  reply: string | null;
  sentByAdmin: boolean;
  leadStatus: LeadStatus;
  statusUpdatedAt: string | null;
  createdAt: string;
  customer: MessageCustomer | null;
}

type LeadStatus = "NEW" | "QUOTED" | "WON" | "LOST";

export interface MessageCustomer {
  id: string;
  email: string;
  customerType: "BUYER" | "SELLER" | "BOTH";
  orders: number;
  sales: number;
}

const STATUSES: { value: LeadStatus; label: string; badge: string; active: string }[] = [
  { value: "NEW", label: "New", badge: "bg-blue-50 text-blue-700", active: "bg-blue-600 text-white border-blue-600" },
  { value: "QUOTED", label: "Quoted", badge: "bg-amber-50 text-amber-800", active: "bg-amber-500 text-white border-amber-500" },
  { value: "WON", label: "Won", badge: "bg-green-50 text-green-700", active: "bg-green-600 text-white border-green-600" },
  { value: "LOST", label: "Lost", badge: "bg-gray-100 text-gray-600", active: "bg-gray-600 text-white border-gray-600" },
];
const STATUS_META = Object.fromEntries(STATUSES.map((st) => [st.value, st])) as Record<LeadStatus, (typeof STATUSES)[number]>;


function daysSince(date: string, now: number) {
  return Math.floor((now - new Date(date).getTime()) / DAY_MS);
}

function needsFollowUp(msg: ContactMessage, now: number) {
  return msg.leadStatus === "QUOTED" && daysSince(msg.statusUpdatedAt ?? msg.createdAt, now) >= FOLLOW_UP_DAYS;
}

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

/** "Customer · 3 orders · $12,400", "Seller", or "New lead". */
function CustomerTag({ customer }: { customer: MessageCustomer | null }) {
  const parts: string[] = [];
  if (customer && customer.orders > 0) {
    parts.push("Customer", `${customer.orders} ${customer.orders === 1 ? "order" : "orders"}`, formatUsd(customer.sales));
  }
  if (customer?.customerType === "SELLER") parts.push("Seller");
  if (customer?.customerType === "BOTH") parts.push("Buyer & Seller");
  const isNew = parts.length === 0;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", isNew ? "bg-violet-50 text-violet-700" : "bg-emerald-50 text-emerald-700")}>
      <UserRound size={12} />
      {isNew ? "New lead" : parts.join(" · ")}
    </span>
  );
}

type Filter = "ALL" | LeadStatus | "FOLLOW_UP";

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short" }).format(new Date(date));
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied.`);
  } catch {
    toast.error("Could not copy. Select the text and copy it manually.");
  }
}

function CopyButton({ text, label }: { text: string; label: string }) {
  return (
    <button
      type="button"
      onClick={() => copyText(text, label)}
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
      className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 flex-shrink-0"
    >
      <Copy size={14} />
    </button>
  );
}

/** Inquiry messages include a "Link: /products/<slug>" line; surface it as a real link. */
function productPath(message: string) {
  return message.match(/^Link: (\/products\/[\w-]+)\s*$/m)?.[1] ?? null;
}

function detailFields(msg: ContactMessage) {
  return [
    { label: "Name", value: msg.name, href: null },
    { label: "Email", value: msg.email, href: `mailto:${msg.email}` },
    { label: "Phone", value: msg.phone, href: msg.phone ? `tel:${msg.phone.replace(/[^\d+]/g, "")}` : null },
    { label: "Job Title", value: msg.jobTitle, href: null },
    { label: "Workplace", value: msg.organization, href: null },
    { label: "Address", value: msg.address, href: null },
    { label: "Work Location", value: msg.workLocation, href: null },
    { label: msg.sentByAdmin ? "Sent" : "Received", value: formatDateTime(msg.createdAt), href: null },
  ];
}

function allDetailsText(msg: ContactMessage) {
  const lines = detailFields(msg)
    .filter((f) => f.value)
    .map((f) => `${f.label}: ${f.value}`);
  lines.push(`Subject: ${msg.subject}`, "", msg.message);
  return lines.join("\n");
}

export default function MessagesList({ initialMessages, customers }: { initialMessages: ContactMessage[]; customers: ComposeRecipient[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [openId, setOpenId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [now] = useState(() => Date.now());
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus "Cancel" when the dialog opens, and let Escape close it.
  useEffect(() => {
    if (!confirmDelete) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmDelete(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmDelete]);

  const handleSent = (sent: SentMessage) => {
    setMessages((prev) => [
      {
        ...sent,
        phone: null, jobTitle: null, organization: null, address: null, workLocation: null,
        isRead: true, reply: null, sentByAdmin: true, leadStatus: "NEW", statusUpdatedAt: null,
        // Reuse the customer tag from an earlier message; otherwise it appears on the next page load.
        customer: prev.find((m) => m.customer?.email.toLowerCase() === sent.email.toLowerCase())?.customer ?? null,
      },
      ...prev,
    ]);
    setFilter("ALL");
  };

  const markAsRead = async (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
    await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
  };

  const handleToggle = (msg: ContactMessage) => {
    const opening = openId !== msg.id;
    setOpenId(opening ? msg.id : null);
    if (opening && !msg.isRead) markAsRead(msg.id);
  };

  const handleSendReply = async (id: string) => {
    const reply = (replyDrafts[id] ?? "").trim();
    if (!reply) {
      toast.error("Write a reply message first.");
      return;
    }
    setSending(id);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true, reply } : m)));
        setReplyDrafts((prev) => ({ ...prev, [id]: "" }));
        toast.success(data.emailSent ? "Reply sent to customer's email." : "Reply saved (email could not be sent).");
      } else {
        toast.error(data.error ?? "Failed to send reply.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setSending(null);
    }
  };

  const handleDelete = async (msg: ContactMessage) => {
    setConfirmDelete(null);
    setDeleting(msg.id);
    try {
      const res = await fetch(`/api/admin/messages/${msg.id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== msg.id));
        setOpenId(null);
        toast.success("Message deleted.");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Failed to delete message.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setDeleting(null);
    }
  };

  const handleStatus = async (msg: ContactMessage, leadStatus: LeadStatus) => {
    if (msg.leadStatus === leadStatus) return;
    const previous = { leadStatus: msg.leadStatus, statusUpdatedAt: msg.statusUpdatedAt };
    const update = (fields: Pick<ContactMessage, "leadStatus" | "statusUpdatedAt">) =>
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...fields } : m)));
    update({ leadStatus, statusUpdatedAt: new Date().toISOString() });
    try {
      const res = await fetch(`/api/admin/messages/${msg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Marked as ${STATUS_META[leadStatus].label}.`);
    } catch {
      update(previous);
      toast.error("Could not update the status.");
    }
  };

  const counts: Record<Filter, number> = {
    ALL: messages.length,
    NEW: 0, QUOTED: 0, WON: 0, LOST: 0,
    FOLLOW_UP: messages.filter((m) => needsFollowUp(m, now)).length,
  };
  for (const m of messages) counts[m.leadStatus]++;
  const unread = messages.filter((m) => !m.isRead).length;

  const visible = messages.filter((m) =>
    filter === "ALL" ? true : filter === "FOLLOW_UP" ? needsFollowUp(m, now) : m.leadStatus === filter,
  );

  const tabs: { value: Filter; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "NEW", label: "New" },
    { value: "QUOTED", label: "Quoted" },
    { value: "FOLLOW_UP", label: "Needs follow-up" },
    { value: "WON", label: "Won" },
    { value: "LOST", label: "Lost" },
  ];

  // The "New message" button sits in the page header so it's the first thing on the page.
  const header = (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
        <p className="text-gray-500 text-sm">Track every inquiry from first message to won or lost, or start a new conversation.</p>
      </div>
      <ComposeMessageDialog customers={customers} onSent={handleSent} />
    </div>
  );

  if (messages.length === 0) {
    return (
      <div>
        {header}
        <div className="p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-500">No messages yet.</p>
          <p className="text-gray-400 text-sm mt-1">Messages from your contact form will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <>
    {header}
    {confirmDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirmDelete(null)}>
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-message-title"
          aria-describedby="delete-message-desc"
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <Trash2 size={18} />
            </div>
            <div className="min-w-0">
              <h2 id="delete-message-title" className="font-semibold text-gray-900">Delete this message?</h2>
              <div id="delete-message-desc" className="mt-2 text-sm text-gray-600 space-y-2">
                <p className="break-words">
                  <span className="font-medium text-gray-900">{confirmDelete.name}</span> ({confirmDelete.email})
                  <br />
                  {confirmDelete.subject}
                </p>
                <p>This can&apos;t be undone. Their customer record will be kept.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              ref={cancelRef}
              type="button"
              onClick={() => setConfirmDelete(null)}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleDelete(confirmDelete)}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Yes, delete
            </button>
          </div>
        </div>
      </div>
    )}
    <div className="flex flex-wrap items-center gap-2 mb-4" role="group" aria-label="Filter messages by status">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => setFilter(t.value)}
          aria-pressed={filter === t.value}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500",
            filter === t.value ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
            t.value === "FOLLOW_UP" && counts.FOLLOW_UP > 0 && filter !== t.value && "border-amber-300 text-amber-800 bg-amber-50",
          )}
        >
          {t.value === "FOLLOW_UP" && <AlarmClock size={14} />}
          {t.label}
          <span className={cn("text-xs", filter === t.value ? "text-white/70" : "text-gray-400")}>{counts[t.value]}</span>
        </button>
      ))}
      <span className="ml-auto text-sm text-gray-500">{unread} unread</span>
    </div>
    <div className="bg-white rounded-2xl border overflow-hidden">
    {visible.length === 0 && (
      <p className="p-10 text-center text-sm text-gray-500">No messages in this view.</p>
    )}
    <div className="divide-y">
      {visible.map((msg) => {
        const isOpen = openId === msg.id;
        return (
          <div key={msg.id} className={!msg.isRead ? "bg-blue-50/50" : ""}>
            {/* A div, not a button, so the name, email and message text can be selected and copied. */}
            <div
              onClick={() => {
                if (window.getSelection()?.toString()) return;
                handleToggle(msg);
              }}
              className="w-full flex gap-4 p-5 hover:bg-gray-50 text-left cursor-pointer select-text"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!msg.isRead ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-500"}`}>
                {msg.isRead ? <MailOpen size={18} /> : <Mail size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 break-words">{msg.name}</p>
                    <p className="text-sm text-gray-500 break-all">{msg.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-xs text-gray-400">{formatDate(msg.createdAt)}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(msg);
                      }}
                      disabled={deleting === msg.id}
                      aria-label={`Delete message from ${msg.name}`}
                      title="Delete message"
                      className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(msg);
                      }}
                      aria-expanded={isOpen}
                      aria-label={isOpen ? `Hide details for ${msg.name}` : `Show details for ${msg.name}`}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700 mt-1">{msg.subject}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", STATUS_META[msg.leadStatus].badge)}>
                    {STATUS_META[msg.leadStatus].label}
                  </span>
                  {msg.sentByAdmin && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700">
                      <Forward size={12} /> Sent by you
                    </span>
                  )}
                  {needsFollowUp(msg, now) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
                      <AlarmClock size={12} /> Follow up · quoted {daysSince(msg.statusUpdatedAt ?? msg.createdAt, now)} days ago
                    </span>
                  )}
                  <CustomerTag customer={msg.customer} />
                </div>
                {!isOpen && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{msg.message}</p>}
                {msg.reply && !isOpen && (
                  <p className="text-xs text-green-700 mt-1.5 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Replied
                  </p>
                )}
              </div>
            </div>

            {isOpen && (
              <div className="px-5 pb-5 sm:pl-[4.5rem] space-y-4 select-text">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Lead status">
                    <span className="text-xs font-medium text-gray-500 mr-1">Status</span>
                    {STATUSES.map((st) => (
                      <button
                        key={st.value}
                        type="button"
                        onClick={() => handleStatus(msg, st.value)}
                        aria-pressed={msg.leadStatus === st.value}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500",
                          msg.leadStatus === st.value ? st.active : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
                        )}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                  {msg.customer && (
                    <Link
                      href={`/admin/customers?q=${encodeURIComponent(msg.customer.email)}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:underline"
                    >
                      <UserRound size={14} /> View customer record
                    </Link>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">{msg.sentByAdmin ? "Recipient" : "Customer details"}</h3>
                    <button
                      type="button"
                      onClick={() => copyText(allDetailsText(msg), "All details")}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <Copy size={12} /> Copy all
                    </button>
                  </div>
                  <dl className="divide-y divide-gray-100">
                    {detailFields(msg).map((f) => (
                      <div key={f.label} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-3 px-4 py-2">
                        <dt className="text-xs font-medium text-gray-500">{f.label}</dt>
                        <dd className="text-sm text-gray-900 break-words min-w-0">
                          {!f.value ? (
                            <span className="text-gray-400">Not provided</span>
                          ) : f.href ? (
                            <a href={f.href} className="text-primary-700 hover:underline">{f.value}</a>
                          ) : (
                            f.value
                          )}
                        </dd>
                        {f.value ? <CopyButton text={f.value} label={f.label} /> : <span className="w-7" />}
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 break-words min-w-0">{msg.subject}</h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {productPath(msg.message) && (
                        <Link
                          href={productPath(msg.message)!}
                          target="_blank"
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-700 hover:underline"
                        >
                          <ExternalLink size={12} /> View product
                        </Link>
                      )}
                      <CopyButton text={msg.message} label="Message" />
                    </div>
                  </div>
                  {msg.sentByAdmin && <p className="px-4 pt-3 text-xs font-semibold text-primary-700">Your message to {msg.name}</p>}
                  <p className="px-4 py-3 text-sm text-gray-800 whitespace-pre-line break-words">{msg.message}</p>
                </div>

                {msg.reply && (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-3">
                    <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                      <CheckCircle2 size={12} /> {msg.sentByAdmin ? "Your follow-up" : "Your reply"}
                    </p>
                    <p className="text-sm text-green-800 whitespace-pre-line">{msg.reply}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <textarea
                    rows={3}
                    value={replyDrafts[msg.id] ?? ""}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [msg.id]: e.target.value }))}
                    placeholder={msg.sentByAdmin ? `Follow up with ${msg.name}...` : `Reply to ${msg.name}...`}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <button
                    onClick={() => handleSendReply(msg.id)}
                    disabled={sending === msg.id}
                    className="self-end flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-60 whitespace-nowrap"
                  >
                    <Send size={14} />
                    {sending === msg.id ? "Sending..." : msg.sentByAdmin ? "Send Follow-up" : "Send Reply"}
                  </button>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(msg)}
                    disabled={deleting === msg.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60"
                  >
                    <Trash2 size={14} />
                    {deleting === msg.id ? "Deleting..." : "Delete message"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
    </div>
    </>
  );
}
