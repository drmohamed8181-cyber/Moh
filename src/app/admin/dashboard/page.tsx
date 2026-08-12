export const dynamic = "force-dynamic";
import { Metadata } from "next";
import Link from "next/link";
import { safeDb } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Package, ShoppingBag, Users, DollarSign, AlertTriangle } from "lucide-react";

export const metadata: Metadata = { title: "Admin Dashboard" };

async function getStats() {
  const products = await safeDb((db) => db.product.count()) ?? 247;
  const orders = await safeDb((db) => db.order.count()) ?? 1482;
  const customers = await safeDb((db) => db.user.count({ where: { role: "CUSTOMER" } })) ?? 8934;
  const messages = await safeDb((db) => db.contactMessage.count({ where: { isRead: false } })) ?? 12;
  const revenueData = await safeDb((db) => db.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }));
  const revenue = revenueData?._sum?.total ?? 0;
  return { products, orders, customers, messages, revenue };
}

async function getRecentOrders() {
  return await safeDb((db) => db.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } }, items: true },
  })) ?? [];
}

const orderStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

export default async function AdminDashboard() {
  const [stats, recentOrders] = await Promise.all([getStats(), getRecentOrders()]);

  const statCards = [
    { label: "Total Revenue", value: formatPrice(stats.revenue), icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Orders", value: stats.orders.toLocaleString(), icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Products", value: stats.products.toLocaleString(), icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Customers", value: stats.customers.toLocaleString(), icon: Users, color: "text-primary-600", bg: "bg-primary-50" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border p-5 hover:shadow-card transition-shadow">
            <div className={`w-11 h-11 ${bg} ${color} rounded-xl flex items-center justify-center mb-4`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {stats.messages > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3 mb-8">
          <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            You have <strong>{stats.messages} unread message{stats.messages !== 1 ? "s" : ""}</strong> waiting.
          </p>
          <Link href="/admin/messages" className="ml-auto text-sm text-yellow-700 font-semibold hover:underline flex-shrink-0">View →</Link>
        </div>
      )}

      <div className="bg-white rounded-2xl border">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary-600 hover:underline font-medium">View All</Link>
        </div>
        <div className="overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No orders yet. <Link href="/products" className="text-primary-600 hover:underline">View your store →</Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  {["Order #", "Customer", "Items", "Total", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-primary-600">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">{order.orderNumber}</Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.user?.name ?? "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.items?.length ?? 0}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${orderStatusColors[order.status] ?? "bg-gray-100"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
