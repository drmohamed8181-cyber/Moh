import { NextRequest, NextResponse } from "next/server";
import { safeDb } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    await safeDb((db) => db.contactMessage.create({
      data: { name, email, phone: phone || null, subject: subject || "General Inquiry", message },
    }));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
