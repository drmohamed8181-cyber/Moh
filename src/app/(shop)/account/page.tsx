import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { safeDb } from "@/lib/prisma";
import Link from "next/link";
import { Package, Heart, MapPin, Settings, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

const statusColors: Record<string, "blue" | "green" | "yellow" | "red" | "gray"> = {
  PENDING: "yellow", CONFIRMED: "blue", PROCESSING: "blue",
  SHIPPED: "blue", DELIVERED: "green", CANCELLED: "red", REFUNDED: "gray",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const user = await safeDb((db) => db.user.findUnique({
    where: { id: userId },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 5 },
      _count: { select: { orders: true, wishlist: true, addresses: true } },
    },
  }));

  if (!user) redirect("/login");

  const links = [
    { icon: Package, label: "My Orders", href: "/account/orders", count: user._count.orders },
    { icon: Heart, label: "Wishlist", href: "/account/wishlist", count: user._count.wishlist },
    { icon: MapPin, label: "Addresses", href: "/account/addresses", count: user._count.addresses },
    { icon: Settings, label: "Settings", href: "/account/settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-slate-400 text-sm">{user.email}</p>
            {user.phone && <p className="text-slate-400 text-sm">{user.phone}</p>}
          </div>
          <Link href="/account/settings" className="text-slate-400 hover:text-slate-600">
            <Settings className="w-5 h-5" />
          </Link>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {links.map(({ icon: Icon, label, href, count }) => (
            <Link key={href} href={href} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow group">
              <Icon className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{label}</p>
              {count !== undefined && <p className="text-slate-400 text-xs mt-0.5">{count} items</p>}
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Recent Orders</h2>
            <Link href="/account/orders" className="text-xs text-blue-600 font-medium hover:text-blue-700">View all</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {user.orders.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-slate-400">No orders yet</p>
            ) : (
              user.orders.map((order) => (
                <Link key={order.id} href={`/account/orders/${order.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{order.orderNumber}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusColors[order.status] ?? "gray"}>{order.status}</Badge>
                    <span className="font-semibold text-slate-800 text-sm">{formatPrice(order.total)}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
