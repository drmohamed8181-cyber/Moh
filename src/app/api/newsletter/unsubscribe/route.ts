import { NextRequest, NextResponse } from "next/server";
import { safeDb } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";
import { escapeHtml } from "@/lib/utils";

function htmlPage(body: string) {
  return new NextResponse(
    `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;text-align:center;padding:60px 20px;">${body}</body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") ?? "";
  const token = req.nextUrl.searchParams.get("token") ?? "";

  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return htmlPage(`<h2>Invalid or expired unsubscribe link</h2>`);
  }

  const address = email.trim().toLowerCase();
  // Removes them from the newsletter list and records the opt-out, which every
  // marketing send (digest and campaigns) checks, so it stops all marketing email.
  await safeDb((db) => db.newsletter.deleteMany({ where: { email: { equals: address, mode: "insensitive" } } }));
  await safeDb((db) => db.emailOptOut.upsert({ where: { email: address }, update: {}, create: { email: address } }));

  return htmlPage(
    `<h2>You've been unsubscribed</h2><p>${escapeHtml(email)} will no longer receive marketing emails from MP MedPharma.</p>`
  );
}
