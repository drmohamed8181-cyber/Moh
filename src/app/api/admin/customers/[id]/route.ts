import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";

async function checkAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  return ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"].includes(role ?? "");
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const customer = await safeDb((db) => db.user.findUnique({ where: { id }, select: { name: true, phone: true } }));
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const organization = typeof body.organization === "string" ? body.organization.trim() || null : undefined;

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
    if (organization !== undefined) {
      await db.user.update({ where: { id }, data: { organization } });
    }

    if (address) {
      const { street, city, state, zip, country } = address;
      const existing = await db.address.findFirst({ where: { userId: id, isDefault: true } });
      const addressData = {
        name: organization || customer.name || "Organization",
        phone: customer.phone || "",
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
