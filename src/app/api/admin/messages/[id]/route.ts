import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { escapeHtml } from "@/lib/utils";

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

  const data: { isRead?: boolean; reply?: string } = {};
  if (typeof body.isRead === "boolean") data.isRead = body.isRead;

  let emailSent = false;
  if (typeof body.reply === "string" && body.reply.trim()) {
    const replyText = body.reply.trim();
    data.reply = replyText;
    data.isRead = true;
    emailSent = await sendMail({
      to: message.email,
      subject: `Re: ${message.subject}`,
      html: `
        <p>Hi ${escapeHtml(message.name)},</p>
        <p>${escapeHtml(replyText).replace(/\n/g, "<br/>")}</p>
        <hr/>
        <p style="color:#888;font-size:12px;">In reply to your message: "${escapeHtml(message.message)}"</p>
      `,
    });
  }

  const updated = await safeDb((db) => db.contactMessage.update({ where: { id }, data }));
  if (!updated) return NextResponse.json({ error: "Failed to update message" }, { status: 500 });

  return NextResponse.json({ message: updated, emailSent });
}
