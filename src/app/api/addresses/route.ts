import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const addresses = await safeDb((db) => db.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }],
  })) ?? [];

  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, phone, street, city, state, zip, country, label, isDefault } = body;
  if (!name || !phone || !street || !city || !state || !zip) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const userId = session.user.id;

  if (isDefault) {
    await safeDb((db) => db.address.updateMany({ where: { userId }, data: { isDefault: false } }));
  }

  const address = await safeDb((db) => db.address.create({
    data: {
      userId,
      name,
      phone,
      street,
      city,
      state,
      zip,
      country: country || "US",
      label: label || "Home",
      isDefault: !!isDefault,
    },
  }));

  return NextResponse.json({ address });
}
