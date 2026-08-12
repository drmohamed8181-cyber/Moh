import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { safeDb } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password || typeof password !== "string") {
      return NextResponse.json({ error: "Missing token or password" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const record = await safeDb((db) => db.verificationToken.findUnique({ where: { token } }));
    if (!record || record.expires < new Date()) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    await safeDb((db) => db.user.update({
      where: { email: record.identifier },
      data: { password: hashed },
    }));
    await safeDb((db) => db.verificationToken.delete({ where: { token } }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
