"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Reply, Check } from "lucide-react";

interface Message {
  id: string;
  isRead: boolean;
  reply?: string | null;
}

export default function MessageActions({ message }: { message: Message }) {
  const [showReply, setShowReply] = useState(false);
  const [reply, setReply] = useState(message.reply ?? "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const markRead = async () => {
    await fetch(`/api/admin/messages/${message.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    router.refresh();
  };

  const sendReply = async () => {
    setSaving(true);
    await fetch(`/api/admin/messages/${message.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply, isRead: true }),
    });
    setSaving(false);
    setShowReply(false);
    router.refresh();
  };

  const deleteMsg = async () => {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/admin/messages/${message.id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {!message.isRead && (
          <button onClick={markRead} className="p-1.5 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Mark as read">
            <Check className="w-4 h-4" />
          </button>
        )}
        <button onClick={() => setShowReply(!showReply)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Reply">
          <Reply className="w-4 h-4" />
        </button>
        <button onClick={deleteMsg} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {showReply && (
        <div className="min-w-[240px]">
          <textarea
            rows={3}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Type your reply…"
          />
          <div className="flex gap-2 mt-1.5">
            <button
              onClick={sendReply}
              disabled={saving || !reply.trim()}
              className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Reply"}
            </button>
            <button onClick={() => setShowReply(false)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-lg hover:bg-slate-200">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
