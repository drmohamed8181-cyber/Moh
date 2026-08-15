import { NextRequest, NextResponse } from "next/server";
import { safeDb } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { escapeHtml } from "@/lib/utils";

const NOTIFY_EMAIL = process.env.CONTACT_NOTIFY_EMAIL || process.env.PRODUCT_SUBMISSION_NOTIFY_EMAIL || "dr.mohamed8181@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!checkRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
    }

    const { name, email, phone, subject, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const finalSubject = subject || "General Inquiry";
    const saved = await safeDb((db) => db.contactMessage.create({
      data: { name, email, phone: phone || null, subject: finalSubject, message },
    }));
    if (!saved) {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    await sendMail({
      to: NOTIFY_EMAIL,
      subject: `New Contact Message: ${finalSubject}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="color:#0a2540;">New Contact Message</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Name</td><td>${escapeHtml(name)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Email</td><td>${escapeHtml(email)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Phone</td><td>${escapeHtml(phone || "—")}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Subject</td><td>${escapeHtml(finalSubject)}</td></tr>
          </table>
          <p style="margin-top:16px;color:#0a2540;font-weight:600;">Message</p>
          <p style="white-space:pre-line;color:#333;line-height:1.6;">${escapeHtml(message)}</p>
        </div>`,
      text: `New contact message from ${name} (${email}${phone ? `, ${phone}` : ""})\nSubject: ${finalSubject}\n\n${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
