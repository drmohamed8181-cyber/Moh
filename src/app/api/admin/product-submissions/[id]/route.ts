import { NextRequest, NextResponse } from "next/server";
import type { SubmissionStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { deletePrivateImage } from "@/lib/cloudinary";
import { INFO_EMAIL, infoSignatureHtml, infoSignatureText } from "@/lib/emailSignature";
import { escapeHtml } from "@/lib/utils";
import { PRICE_CONFIRM_ERROR, containsPrice, redactPrices } from "@/lib/priceGuard";

const VALID_STATUSES: SubmissionStatus[] = ["NEW", "REVIEWING", "ACCEPTED", "DECLINED"];

async function checkAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  return ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"].includes(role ?? "");
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const data: { status?: SubmissionStatus; adminNotes?: string | null } = {};
  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status as SubmissionStatus;
  }
  if (body.adminNotes !== undefined) {
    data.adminNotes = typeof body.adminNotes === "string" ? body.adminNotes.trim() || null : null;
  }

  const submission = await safeDb((db) => db.productSubmission.update({ where: { id }, data }));
  if (!submission) return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
  return NextResponse.json(submission);
}

// Emails the seller from the admin page. Each reply is logged at the end of the internal notes,
// since submissions have no reply column.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const replyText = typeof body.reply === "string" ? body.reply.trim() : "";
  if (!replyText) return NextResponse.json({ error: "Write a reply message first." }, { status: 400 });

  // An offer amount goes out only when the admin ticked "This reply includes a price".
  const priceQuote = containsPrice(replyText);
  if (priceQuote && body.priceQuote !== true) {
    return NextResponse.json({ error: PRICE_CONFIRM_ERROR }, { status: 400 });
  }

  const submission = await safeDb((db) => db.productSubmission.findUnique({ where: { id } }));
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const subject = `Re: Your equipment submission ${submission.referenceNumber} – ${redactPrices(submission.productName)}`;
  const emailSent = await sendMail({
    to: submission.email,
    replyTo: INFO_EMAIL,
    subject,
    html: `
      <p>${escapeHtml(replyText).replace(/\n/g, "<br/>")}</p>
      ${infoSignatureHtml}
      <hr/>
      <p style="color:#888;font-size:12px;">Regarding your submission ${escapeHtml(submission.referenceNumber)}: ${escapeHtml(redactPrices(submission.productName))}</p>
    `,
    text: `${replyText}\n\n${infoSignatureText}\n\n---\nRegarding your submission ${submission.referenceNumber}: ${redactPrices(submission.productName)}`,
    priceQuote,
  });
  if (!emailSent) return NextResponse.json({ error: "The email could not be sent. Nothing was saved." }, { status: 502 });

  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const logEntry = `[Reply emailed ${stamp} UTC]\n${replyText}`;
  const adminNotes = submission.adminNotes ? `${submission.adminNotes}\n\n${logEntry}` : logEntry;
  const updated = await safeDb((db) =>
    db.productSubmission.update({
      where: { id },
      data: { adminNotes, ...(submission.status === "NEW" ? { status: "REVIEWING" as SubmissionStatus } : {}) },
    })
  );

  return NextResponse.json({ emailSent, submission: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const submission = await safeDb((db) => db.productSubmission.findUnique({ where: { id }, select: { id: true, images: true } }));
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // The seller's private photos go with the submission, so they are not left on Cloudinary.
  const images = Array.isArray(submission.images) ? (submission.images as unknown as { publicId?: string }[]) : [];
  await Promise.all(
    images
      .map((img) => img?.publicId)
      .filter((p): p is string => typeof p === "string" && p.length > 0)
      .map((publicId) => deletePrivateImage(publicId).catch((e) => console.error(`Could not delete submission photo ${publicId}:`, e)))
  );

  const deleted = await safeDb((db) => db.productSubmission.delete({ where: { id } }));
  if (!deleted) return NextResponse.json({ error: "Failed to delete submission" }, { status: 500 });
  return NextResponse.json({ success: true });
}
