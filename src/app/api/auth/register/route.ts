import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { safeDb } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!checkRateLimit(`register:ip:${ip}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { name, email, phone, password } = await req.json();
    if (!name || typeof name !== "string" || !email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await safeDb((db) => db.user.findUnique({ where: { email } }));
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 12);
    await safeDb((db) => db.user.create({
      data: { name, email, phone: phone || null, password: hashed },
    }));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
