import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { INFO_EMAIL, infoSignatureHtml, infoSignatureText } from "@/lib/emailSignature";
import { escapeHtml } from "@/lib/utils";
import { saveContactAsCustomer } from "@/lib/customers";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function checkAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  return ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"].includes(role ?? "");
}

/** Start a new conversation: email the customer and keep a copy on the Messages page. */
export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!subject || !message) return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });

  const emailSent = await sendMail({
    to: email,
    replyTo: INFO_EMAIL,
    subject,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
        <p style="white-space:pre-line;color:#333;line-height:1.6;">${escapeHtml(message)}</p>
        ${infoSignatureHtml}
      </div>`,
    text: `${message}\n\n${infoSignatureText}`,
  });
  // Nothing is saved when the email didn't go out, so the list never shows a message the customer never got.
  if (!emailSent) {
    return NextResponse.json({ error: "The email could not be sent. Check the email settings and try again." }, { status: 502 });
  }

  const saved = await safeDb((db) => db.contactMessage.create({
    data: { name: name || email, email, subject, message, sentByAdmin: true, isRead: true },
  }));

  // Keep the recipient in the customer list; never let this fail the send.
  try {
    await saveContactAsCustomer({ name, email });
  } catch (error) {
    console.error("Failed to save message recipient as customer", error);
  }

  return NextResponse.json({ message: saved, emailSent, saved: Boolean(saved) });
}
