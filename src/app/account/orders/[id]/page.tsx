import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, Package } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth().catch(() => null);
  if (!session?.user) redirect("/login");

  const order = await safeDb((db) => db.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { name: true, slug: true, images: true } } } } },
  }));

  if (!order || order.userId !== session.user.id) notFound();

  const address = order.shippingAddress as {
    name?: string; phone?: string; street?: string; city?: string; state?: string; zip?: string; country?: string;
  } | null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to My Orders
          </Link>

          <div className="bg-white rounded-2xl border p-6 mb-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="font-bold text-gray-900 text-lg">{order.orderNumber}</p>
                <p className="text-sm text-gray-400 mt-1">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusColors[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl border">
              <div className="px-6 py-4 border-b">
                <h2 className="font-semibold text-gray-900">Items</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="relative w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                      {item.product.images[0] ? (
                        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-contain p-1.5" sizes="56px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={18} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product.slug}`} className="text-sm font-medium text-gray-900 hover:text-primary-600 line-clamp-1">
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span><span>{formatPrice(order.shipping)}</span>
                  </div>
                  {order.tax > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span><span>{formatPrice(order.tax)}</span>
                    </div>
                  )}
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span><span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 pt-2 border-t">
                    <span>Total</span><span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              {address && (
                <div className="bg-white rounded-2xl border p-6">
                  <h2 className="font-semibold text-gray-900 mb-3">Shipping Address</h2>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    {address.name && <p className="font-medium text-gray-900">{address.name}</p>}
                    {address.street && <p>{address.street}</p>}
                    {(address.city || address.state || address.zip) && (
                      <p>{[address.city, address.state, address.zip].filter(Boolean).join(", ")}</p>
                    )}
                    {address.phone && <p className="mt-1">{address.phone}</p>}
                  </div>
                </div>
              )}

              {order.notes && (
                <div className="bg-white rounded-2xl border p-6">
                  <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
