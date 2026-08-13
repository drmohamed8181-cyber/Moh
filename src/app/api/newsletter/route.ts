import { NextRequest, NextResponse } from "next/server";
import { safeDb } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, name, phone, address, jobTitle, organization } = await req.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const clean = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  const data = {
    name: clean(name),
    phone: clean(phone),
    address: clean(address),
    jobTitle: clean(jobTitle),
    organization: clean(organization),
  };

  const result = await safeDb((db) => db.newsletter.upsert({
    where: { email },
    update: data,
    create: { email, ...data },
  }));

  if (!result) return NextResponse.json({ error: "Server error" }, { status: 500 });
  return NextResponse.json({ success: true });
}
