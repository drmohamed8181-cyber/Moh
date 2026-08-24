import { NextRequest, NextResponse } from "next/server";
import { safeDb } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!checkRateLimit(`professional-connection:${ip}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { fullName, email, phone, organization, role, interest, message, consent } = await req.json();

    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ error: "Consent is required" }, { status: 400 });
    }

    await safeDb((db) =>
      db.professionalConnection.create({
        data: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone?.trim() || null,
          organization: organization?.trim() || null,
          role: role?.trim() || null,
          interest: interest?.trim() || null,
          message: message?.trim() || null,
          consent: Boolean(consent),
        },
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
