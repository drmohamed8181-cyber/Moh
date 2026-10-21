import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function checkAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  return ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"].includes(role ?? "");
}

/** Add a customer by hand. They get no password; they can set one later via "Forgot password". */
export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "A valid email is required" }, { status: 400 });

  const text = (v: unknown) => (typeof v === "string" ? v.trim() || null : null);
  const name = text(body.name);
  const phone = text(body.phone);
  const organization = text(body.organization);
  const customerType = ["BUYER", "SELLER", "BOTH"].includes(body.customerType)
    ? (body.customerType as "BUYER" | "SELLER" | "BOTH")
    : "BUYER";

  const rawAddress = body.address as
    | { street?: string; city?: string; state?: string; zip?: string; country?: string }
    | undefined;
  if (rawAddress && (!rawAddress.street || !rawAddress.city || !rawAddress.state || !rawAddress.zip)) {
    return NextResponse.json({ error: "Missing required address fields" }, { status: 400 });
  }

  const existing = await safeDb((db) => db.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  }));
  if (existing) return NextResponse.json({ error: "A customer with this email already exists" }, { status: 409 });

  const created = await safeDb((db) => db.user.create({
    data: {
      name,
      email,
      phone,
      organization,
      customerType,
      ...(rawAddress
        ? {
            addresses: {
              create: {
                name: organization || name || "Organization",
                phone: phone || "",
                street: rawAddress.street as string,
                city: rawAddress.city as string,
                state: rawAddress.state as string,
                zip: rawAddress.zip as string,
                country: rawAddress.country || "US",
                label: "Organization",
                isDefault: true,
              },
            },
          }
        : {}),
    },
  }));

  if (!created) return NextResponse.json({ error: "Failed to add customer" }, { status: 500 });
  return NextResponse.json(created, { status: 201 });
}
