"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, MailOpen, MessageSquare, Send, ChevronDown, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  reply: string | null;
  createdAt: string;
}

export default function MessagesList({ initialMessages }: { initialMessages: ContactMessage[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [openId, setOpenId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);

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
            <button onClick={() => handleToggle(msg)} className="w-full flex gap-4 p-5 hover:bg-gray-50 text-left">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!msg.isRead ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-500"}`}>
                {msg.isRead ? <MailOpen size={18} /> : <Mail size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{msg.name}</p>
                    <p className="text-sm text-gray-500">{msg.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-xs text-gray-400">{formatDate(msg.createdAt)}</p>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700 mt-1">{msg.subject}</p>
                <p className={`text-sm text-gray-500 mt-1 ${isOpen ? "" : "line-clamp-2"}`}>{msg.message}</p>
                {msg.reply && !isOpen && (
                  <p className="text-xs text-green-700 mt-1.5 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Replied
                  </p>
                )}
              </div>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pl-[4.5rem]">
                {msg.phone && <p className="text-xs text-gray-500 mb-3">Phone: {msg.phone}</p>}
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
