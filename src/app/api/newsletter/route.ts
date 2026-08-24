import { NextRequest, NextResponse } from "next/server";
import { safeDb } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`newsletter:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

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
