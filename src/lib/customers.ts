import type { OrderStatus } from "@prisma/client";
import { safeDb } from "@/lib/prisma";

// Cancelled and refunded orders don't count toward sales.
export const NON_SALE_STATUSES: OrderStatus[] = ["CANCELLED", "REFUNDED"];

/** Total sales per customer id (order totals, excluding cancelled/refunded). */
export async function getSalesByUser(userIds: string[]) {
  const rows = userIds.length
    ? await safeDb((db) => db.order.groupBy({
        by: ["userId"],
        where: { userId: { in: userIds }, status: { notIn: NON_SALE_STATUSES } },
        _sum: { total: true },
      })) ?? []
    : [];
  return new Map(rows.map((r) => [r.userId, r._sum.total ?? 0]));
}

/**
 * Keep everyone who contacts us in the customer list. Creates a CUSTOMER with
 * no password (they can set one later via "Forgot password"), or fills in
 * blank name/phone/workplace on an existing customer. Never overwrites data
 * already on file and never touches staff accounts.
 *
 * `asSeller` (someone offering us equipment) saves new people as SELLER and
 * turns an existing BUYER into BOTH. Other contacts keep their current type.
 */
export async function saveContactAsCustomer(contact: {
  name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  asSeller?: boolean;
}) {
  const email = contact.email.trim().toLowerCase();
  const name = contact.name.trim() || null;
  const phone = contact.phone?.trim() || null;
  const organization = contact.organization?.trim() || null;

  const existing = await safeDb((db) => db.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, role: true, name: true, phone: true, organization: true, customerType: true },
  }));

  if (!existing) {
    await safeDb((db) => db.user.create({
      data: { name, email, phone, organization, customerType: contact.asSeller ? "SELLER" : "BUYER" },
    }));
    return;
  }
  if (existing.role !== "CUSTOMER") return;

  const data: { name?: string; phone?: string; organization?: string; customerType?: "BOTH" } = {};
  if (contact.asSeller && existing.customerType === "BUYER") data.customerType = "BOTH";
  if (!existing.name && name) data.name = name;
  if (!existing.phone && phone) data.phone = phone;
  if (!existing.organization && organization) data.organization = organization;
  if (Object.keys(data).length) {
    await safeDb((db) => db.user.update({ where: { id: existing.id }, data }));
  }
}
