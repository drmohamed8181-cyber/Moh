export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { safeDb } from "@/lib/prisma";
import MessagesList from "@/components/admin/MessagesList";

export const metadata: Metadata = { title: "Messages – Admin" };

export default async function AdminMessagesPage() {
  const rows = await safeDb((db) => db.contactMessage.findMany({ orderBy: { createdAt: "desc" } })) ?? [];
  const messages = rows.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-500 text-sm">{messages.filter((m) => !m.isRead).length} unread</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <MessagesList initialMessages={messages} />
      </div>
    </div>
  );
}
