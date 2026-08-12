import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Package } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function AccountOrdersPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const orders = await safeDb((db) => db.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  })) ?? [];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border p-16 text-center">
              <Package size={40} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You haven&apos;t placed any orders yet.</p>
              <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link key={order.id} href={`/account/orders/${order.id}`} className="block bg-white rounded-2xl border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Order Number</p>
                      <p className="font-bold text-gray-900">{order.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                      <p className="font-bold text-primary-700 text-lg">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4 flex-wrap">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusColors[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {order.status}
                    </span>
                    <span className="text-sm text-gray-500">{order.items.length} item(s)</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
