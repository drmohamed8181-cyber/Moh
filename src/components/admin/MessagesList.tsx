"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Mail, MailOpen, MessageSquare, Send, ChevronDown, CheckCircle2, Copy, ExternalLink, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

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
  createdAt: string;
}

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
    { label: "Received", value: formatDateTime(msg.createdAt), href: null },
  ];
}

function allDetailsText(msg: ContactMessage) {
  const lines = detailFields(msg)
    .filter((f) => f.value)
    .map((f) => `${f.label}: ${f.value}`);
  lines.push(`Subject: ${msg.subject}`, "", msg.message);
  return lines.join("\n");
}

export default function MessagesList({ initialMessages }: { initialMessages: ContactMessage[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [openId, setOpenId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

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
    if (!confirm(`Delete the message from ${msg.name}? This cannot be undone. Their customer record is kept.`)) return;
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

  if (messages.length === 0) {
    return (
      <div className="p-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageSquare size={28} className="text-gray-400" />
        </div>
        <p className="text-gray-500">No messages yet.</p>
        <p className="text-gray-400 text-sm mt-1">Messages from your contact form will appear here.</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {messages.map((msg) => {
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
                        handleDelete(msg);
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
                <div className="bg-white border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Customer details</h3>
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
                  <p className="px-4 py-3 text-sm text-gray-800 whitespace-pre-line break-words">{msg.message}</p>
                </div>

                {msg.reply && (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-3">
                    <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Your reply
                    </p>
                    <p className="text-sm text-green-800 whitespace-pre-line">{msg.reply}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <textarea
                    rows={3}
                    value={replyDrafts[msg.id] ?? ""}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [msg.id]: e.target.value }))}
                    placeholder={`Reply to ${msg.name}...`}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <button
                    onClick={() => handleSendReply(msg.id)}
                    disabled={sending === msg.id}
                    className="self-end flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-60 whitespace-nowrap"
                  >
                    <Send size={14} />
                    {sending === msg.id ? "Sending..." : "Send Reply"}
                  </button>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDelete(msg)}
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
  );
}
