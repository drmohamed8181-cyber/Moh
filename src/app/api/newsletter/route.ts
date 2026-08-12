import { NextRequest, NextResponse } from "next/server";
import { safeDb } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const result = await safeDb((db) => db.newsletter.upsert({
    where: { email },
    update: {},
    create: { email },
  }));

  if (!result) return NextResponse.json({ error: "Server error" }, { status: 500 });
  return NextResponse.json({ success: true });
}
