export const dynamic = "force-dynamic";
import { Metadata } from "next";
import Link from "next/link";
import { safeDb } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

export const metadata: Metadata = { title: "Orders – Admin" };

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

export default async function AdminOrdersPage() {
  const orders = await safeDb((db) => db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } }, items: true },
  })) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm">{orders.length} total</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500">No orders yet.</p>
            <p className="text-gray-400 text-sm mt-1">Orders will appear here once customers start purchasing.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  {["Order #", "Customer", "Items", "Total", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-primary-600">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{order.user?.name ?? "—"}</p>
                      <p className="text-xs text-gray-500">{order.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.items.length}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status] ?? "bg-gray-100"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/orders/${order.id}`} className="text-sm text-primary-600 hover:underline font-medium">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
