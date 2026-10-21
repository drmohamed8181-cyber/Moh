import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function getRole() {
  const session = await auth();
  return (session?.user as { role?: string })?.role ?? "";
}

async function checkAdmin() {
  return ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"].includes(await getRole());
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const customer = await safeDb((db) => db.user.findUnique({ where: { id }, select: { name: true, phone: true, email: true, role: true } }));
  if (!customer || customer.role !== "CUSTOMER") return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  // Strings: undefined leaves the field as is; an empty string clears it.
  const optionalText = (v: unknown) => (typeof v === "string" ? v.trim() || null : undefined);
  const name = optionalText(body.name);
  const phone = optionalText(body.phone);
  const isActive = typeof body.isActive === "boolean" ? body.isActive : undefined;

  let email: string | undefined;
  if (typeof body.email === "string") {
    const newEmail = body.email.trim().toLowerCase();
    if (!EMAIL_RE.test(newEmail)) return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    if (newEmail !== customer.email.toLowerCase()) {
      email = newEmail;
      const taken = await safeDb((db) => db.user.findFirst({
        where: { email: { equals: newEmail, mode: "insensitive" }, NOT: { id } },
        select: { id: true },
      }));
      if (taken) return NextResponse.json({ error: "Another account already uses this email" }, { status: 409 });
    }
  }

  const organization = typeof body.organization === "string" ? body.organization.trim() || null : undefined;
  const customerType = ["BUYER", "SELLER", "BOTH"].includes(body.customerType)
    ? (body.customerType as "BUYER" | "SELLER" | "BOTH")
    : undefined;

  const rawAddress = body.address as
    | { street?: string; city?: string; state?: string; zip?: string; country?: string }
    | undefined;

  if (rawAddress && (!rawAddress.street || !rawAddress.city || !rawAddress.state || !rawAddress.zip)) {
    return NextResponse.json({ error: "Missing required address fields" }, { status: 400 });
  }

  const address = rawAddress
    ? {
        street: rawAddress.street as string,
        city: rawAddress.city as string,
        state: rawAddress.state as string,
        zip: rawAddress.zip as string,
        country: rawAddress.country,
      }
    : undefined;

  const updated = await safeDb(async (db) => {
    await db.user.update({ where: { id }, data: { name, email, phone, isActive, organization, customerType } });

    if (address) {
      const { street, city, state, zip, country } = address;
      const existing = await db.address.findFirst({ where: { userId: id, isDefault: true } });
      const addressData = {
        name: organization || name || customer.name || "Organization",
        phone: phone ?? customer.phone ?? "",
        street,
        city,
        state,
        zip,
        country: country || "US",
        label: "Organization",
        isDefault: true,
      };

      if (existing) {
        await db.address.update({ where: { id: existing.id }, data: addressData });
      } else {
        await db.address.create({ data: { userId: id, ...addressData } });
      }
    }

    return db.user.findUnique({
      where: { id },
      include: { addresses: { where: { isDefault: true }, take: 1 } },
    });
  });

  if (!updated) return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  return NextResponse.json(updated);
}

/**
 * Delete a customer and their saved addresses, cart, wishlist, reviews and sign-ins.
 * Customers with orders are kept so order and sales records stay intact; disable them instead.
 */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!["SUPER_ADMIN", "ADMIN"].includes(await getRole())) {
    return NextResponse.json({ error: "Only admins can delete customers" }, { status: 401 });
  }
  const { id } = await params;

  const customer = await safeDb((db) => db.user.findUnique({
    where: { id },
    select: { role: true, _count: { select: { orders: true } } },
  }));
  if (!customer || customer.role !== "CUSTOMER") return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  if (customer._count.orders > 0) {
    return NextResponse.json(
      { error: "This customer has orders, so they can't be deleted. Disable the account instead." },
      { status: 409 },
    );
  }

  const deleted = await safeDb((db) => db.user.delete({ where: { id } }));
  if (!deleted) return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
