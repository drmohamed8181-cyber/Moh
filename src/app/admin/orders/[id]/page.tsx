import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { safeDb } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import { ArrowLeft, Package } from "lucide-react";

export const metadata: Metadata = { title: "Order Details – Admin" };

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await safeDb((db) => db.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: { include: { product: { select: { name: true, slug: true, images: true } } } },
    },
  }));

  if (!order) notFound();

  const address = order.shippingAddress as {
    name?: string; phone?: string; street?: string; city?: string; state?: string; zip?: string;
  } | null;

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
          <p className="text-gray-500 text-sm mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
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
                  <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Customer</h2>
            <p className="text-sm font-medium text-gray-900">{order.user?.name ?? "—"}</p>
            <p className="text-sm text-gray-500">{order.user?.email}</p>
            {order.user?.phone && <p className="text-sm text-gray-500">{order.user.phone}</p>}
          </div>

          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{formatPrice(order.shipping)}</span></div>
              {order.tax > 0 && <div className="flex justify-between text-gray-600"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>}
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span><span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t"><span>Total</span><span>{formatPrice(order.total)}</span></div>
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
  );
}
