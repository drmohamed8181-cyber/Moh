export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { safeDb } from "@/lib/prisma";
import { getSalesByUser } from "@/lib/customers";
import MessagesList, { type MessageCustomer } from "@/components/admin/MessagesList";

export const metadata: Metadata = { title: "Messages – Admin" };

export default async function AdminMessagesPage() {
  const rows = await safeDb((db) => db.contactMessage.findMany({ orderBy: { createdAt: "desc" } })) ?? [];

  // Match each sender to their customer record (emails are compared case-insensitively).
  const emails = [...new Set(rows.map((m) => m.email.trim().toLowerCase()))];
  const users = emails.length
    ? await safeDb((db) => db.user.findMany({
        where: { role: "CUSTOMER", OR: emails.map((email) => ({ email: { equals: email, mode: "insensitive" as const } })) },
        select: { id: true, email: true, customerType: true, _count: { select: { orders: true } } },
      })) ?? []
    : [];
  const salesByUser = await getSalesByUser(users.map((u) => u.id));
  const customerByEmail = new Map<string, MessageCustomer>(
    users.map((u) => [
      u.email.toLowerCase(),
      { id: u.id, email: u.email, customerType: u.customerType, orders: u._count.orders, sales: salesByUser.get(u.id) ?? 0 },
    ]),
  );

  const messages = rows.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    statusUpdatedAt: m.statusUpdatedAt?.toISOString() ?? null,
    customer: customerByEmail.get(m.email.trim().toLowerCase()) ?? null,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-500 text-sm">Track every inquiry from first message to won or lost.</p>
        </div>
      </div>

      <MessagesList initialMessages={messages} />
    </div>
  );
}
