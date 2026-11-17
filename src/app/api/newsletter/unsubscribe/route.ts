import { NextRequest, NextResponse } from "next/server";
import { safeDb } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";
import { escapeHtml } from "@/lib/utils";

// Unsubscribe from all MP MedPharma marketing email.
//
// GET (the link in an email) only shows a page with an "Unsubscribe" button:
// clinics' email security scanners open every link in incoming mail, and an
// unsubscribe that happened on GET was removing customers who never clicked.
// POST does the unsubscribe: from that button, or from a mail client's
// one-click unsubscribe (RFC 8058 "List-Unsubscribe=One-Click"). No login or
// extra details are asked for, so this stays a single-page opt-out as
// CAN-SPAM allows.

function htmlPage(body: string, status = 200) {
  return new NextResponse(
    `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Unsubscribe | MP MedPharma</title></head><body style="font-family:Arial,sans-serif;text-align:center;padding:60px 20px;color:#232838;">${body}</body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );
}

const INVALID = `<h2>Invalid or expired unsubscribe link</h2><p>Email <a href="mailto:info@mpmedpharma.com">info@mpmedpharma.com</a> and we'll remove you.</p>`;

async function isOptedOut(address: string) {
  const row = await safeDb((db) => db.emailOptOut.findUnique({ where: { email: address } }));
  return Boolean(row);
}

async function optOut(address: string) {
  // Removes them from the newsletter list and records the opt-out, which every
  // marketing send (digest and campaigns) checks, so it stops all marketing email.
  await safeDb((db) => db.newsletter.deleteMany({ where: { email: { equals: address, mode: "insensitive" } } }));
  await safeDb((db) => db.emailOptOut.upsert({ where: { email: address }, update: {}, create: { email: address } }));
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") ?? "";
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!email || !token || !verifyUnsubscribeToken(email, token)) return htmlPage(INVALID, 400);

  const address = email.trim().toLowerCase();
  if (await isOptedOut(address)) {
    return htmlPage(`<h2>You're unsubscribed</h2><p>${escapeHtml(address)} doesn't receive marketing emails from MP MedPharma.</p>`);
  }

  const action = `/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
  return htmlPage(`
    <h2>Unsubscribe from MP MedPharma emails?</h2>
    <p>${escapeHtml(address)} will no longer receive inventory updates or other marketing emails from us.</p>
    <form method="POST" action="${escapeHtml(action)}" style="margin-top:24px;">
      <button type="submit" style="background:#0F1B33;color:#fff;border:0;border-radius:8px;padding:12px 24px;font-size:16px;font-weight:bold;cursor:pointer;">Unsubscribe</button>
    </form>
    <p style="margin-top:24px;font-size:13px;color:#667;">Changed your mind? Just close this page.</p>`);
}

export async function POST(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") ?? "";
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!email || !token || !verifyUnsubscribeToken(email, token)) return htmlPage(INVALID, 400);

  const address = email.trim().toLowerCase();
  await optOut(address);
  return htmlPage(`<h2>You've been unsubscribed</h2><p>${escapeHtml(address)} will no longer receive marketing emails from MP MedPharma.</p>`);
}
