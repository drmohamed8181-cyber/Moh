import { NextRequest, NextResponse } from "next/server";
import type { LeadStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { INFO_EMAIL, infoSignatureHtml, infoSignatureText } from "@/lib/emailSignature";
import { escapeHtml } from "@/lib/utils";
import { PRICE_BLOCKED_ERROR, containsPrice, redactPrices } from "@/lib/priceGuard";

async function checkAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  return ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"].includes(role ?? "");
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const message = await safeDb((db) => db.contactMessage.findUnique({ where: { id } }));
  if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (typeof body.reply === "string" && containsPrice(body.reply)) {
    return NextResponse.json({ error: PRICE_BLOCKED_ERROR }, { status: 400 });
  }

  const data: { isRead?: boolean; reply?: string; leadStatus?: LeadStatus; statusUpdatedAt?: Date } = {};
  if (typeof body.isRead === "boolean") data.isRead = body.isRead;
  if (["NEW", "QUOTED", "WON", "LOST"].includes(body.leadStatus) && body.leadStatus !== message.leadStatus) {
    data.leadStatus = body.leadStatus as LeadStatus;
    data.statusUpdatedAt = new Date();
  }

  let emailSent = false;
  if (typeof body.reply === "string" && body.reply.trim()) {
    const replyText = body.reply.trim();
    data.reply = replyText;
    data.isRead = true;
    // The quoted message and subject can carry an amount the customer typed; never echo one back.
    const quoted = redactPrices(message.message);
    const quoteLabel = message.sentByAdmin ? "Our earlier message" : "In reply to your message";
    // Reply-To is the shared inbox so the customer's answer lands in info@ rather than the sending address.
    emailSent = await sendMail({
      to: message.email,
      replyTo: INFO_EMAIL,
      subject: `Re: ${redactPrices(message.subject)}`,
      html: `
        <p>${escapeHtml(replyText).replace(/\n/g, "<br/>")}</p>
        ${infoSignatureHtml}
        <hr/>
        <p style="color:#888;font-size:12px;">${quoteLabel}: "${escapeHtml(quoted)}"</p>
      `,
      text: `${replyText}\n\n${infoSignatureText}\n\n---\n${quoteLabel}: "${quoted}"`,
    });
  }

  const updated = await safeDb((db) => db.contactMessage.update({ where: { id }, data }));
  if (!updated) return NextResponse.json({ error: "Failed to update message" }, { status: 500 });

  return NextResponse.json({ message: updated, emailSent });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const message = await safeDb((db) => db.contactMessage.findUnique({ where: { id }, select: { id: true } }));
  if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const deleted = await safeDb((db) => db.contactMessage.delete({ where: { id } }));
  if (!deleted) return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });

  return NextResponse.json({ success: true });
}
