import { safeDb } from "@/lib/prisma";

/**
 * Keep everyone who contacts us in the customer list. Creates a CUSTOMER with
 * no password (they can set one later via "Forgot password"), or fills in
 * blank name/phone/workplace on an existing customer. Never overwrites data
 * already on file and never touches staff accounts.
 */
export async function saveContactAsCustomer(contact: {
  name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
}) {
  const email = contact.email.trim().toLowerCase();
  const name = contact.name.trim() || null;
  const phone = contact.phone?.trim() || null;
  const organization = contact.organization?.trim() || null;

  const existing = await safeDb((db) => db.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, role: true, name: true, phone: true, organization: true },
  }));

  if (!existing) {
    await safeDb((db) => db.user.create({ data: { name, email, phone, organization } }));
    return;
  }
  if (existing.role !== "CUSTOMER") return;

  const data: { name?: string; phone?: string; organization?: string } = {};
  if (!existing.name && name) data.name = name;
  if (!existing.phone && phone) data.phone = phone;
  if (!existing.organization && organization) data.organization = organization;
  if (Object.keys(data).length) {
    await safeDb((db) => db.user.update({ where: { id: existing.id }, data }));
  }
}
