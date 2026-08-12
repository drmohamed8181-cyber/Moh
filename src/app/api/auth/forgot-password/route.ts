import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { safeDb } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { escapeHtml } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const ip = getClientIp(req);
    const ipOk = checkRateLimit(`forgot-password:ip:${ip}`, 5, 15 * 60 * 1000);
    const emailOk = checkRateLimit(`forgot-password:email:${email.toLowerCase()}`, 3, 15 * 60 * 1000);
    if (!ipOk || !emailOk) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const user = await safeDb((db) => db.user.findUnique({ where: { email } }));

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await safeDb((db) => db.verificationToken.deleteMany({ where: { identifier: email } }));
      await safeDb((db) => db.verificationToken.create({ data: { identifier: email, token, expires } }));

      const resetUrl = `${req.nextUrl.origin}/reset-password?token=${token}`;
      await sendMail({
        to: email,
        subject: "Reset your MP MedPharma password",
        html: `
          <p>Hi ${escapeHtml(user.name ?? "there")},</p>
          <p>We received a request to reset your MP MedPharma password. Click the link below to choose a new one. This link expires in 1 hour.</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `,
      });
    }

    // Always return success to avoid revealing whether an email is registered.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
