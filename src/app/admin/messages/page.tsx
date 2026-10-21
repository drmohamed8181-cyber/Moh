export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { safeDb } from "@/lib/prisma";
import { getSalesByUser } from "@/lib/customers";
import { inquiryProductPath } from "@/lib/leads";
import { PRICE_DROPS_KEY, parsePriceDrops } from "@/lib/priceDrops";
import { publicListPrice } from "@/lib/publicPricing";
import { NON_OPHTHALMOLOGY_CATEGORY_SLUGS } from "@/lib/specialties";
import MessagesList, { type InquiryPricing, type MessageCustomer } from "@/components/admin/MessagesList";

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

  // Everyone the "New message" picker can suggest.
  const customers = await safeDb((db) => db.user.findMany({
    where: { role: "CUSTOMER" },
    select: { name: true, email: true },
    orderBy: { name: "asc" },
  })) ?? [];

  // Internal prices for each inquiry's product, the same figures as the pricing email.
  const slugOf = (message: string) => inquiryProductPath(message)?.slice("/products/".length) ?? null;
  const slugs = [...new Set(rows.map((m) => slugOf(m.message)).filter((s): s is string => s != null))];
  const products = slugs.length
    ? await safeDb((db) => db.product.findMany({
        where: { slug: { in: slugs } },
        select: { id: true, slug: true, name: true, manufacturer: true, sku: true, category: { select: { slug: true } }, dealerPrice: true, retailPrice: true, retailPricePublic: true },
      })) ?? []
    : [];
  const drops = products.length
    ? parsePriceDrops((await safeDb((db) => db.siteSetting.findUnique({ where: { key: PRICE_DROPS_KEY } })))?.value)
    : {};
  const pricingBySlug = new Map<string, InquiryPricing>(
    products.map((p) => {
      const drop = drops[p.id];
      return [p.slug, {
        productName: p.name,
        productPath: `/products/${p.slug}`,
        manufacturer: p.manufacturer,
        sku: p.sku,
        // Ophthalmology units come from LaserLocators; dental and others from their own supplier.
        partner: p.category && !NON_OPHTHALMOLOGY_CATEGORY_SLUGS.includes(p.category.slug) ? "LaserLocators" : "Supplier",
        dealerPrice: p.dealerPrice,
        listPrice: publicListPrice(p.retailPrice),
        listPricePublic: p.retailPricePublic,
        retailPrice: p.retailPrice,
        drop: drop
          ? { ...drop, previousListRetail: drop.previousListRetail ?? null, listRetail: drop.listRetail ?? null }
          : null,
      }];
    }),
  );

  const messages = rows.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    statusUpdatedAt: m.statusUpdatedAt?.toISOString() ?? null,
    customer: customerByEmail.get(m.email.trim().toLowerCase()) ?? null,
    pricing: pricingBySlug.get(slugOf(m.message) ?? "") ?? null,
  }));

  return (
    <MessagesList initialMessages={messages} customers={customers} />
  );
}
