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

  await safeDb((db) => db.newsletter.deleteMany({ where: { email } }));

  return htmlPage(
    `<h2>You've been unsubscribed</h2><p>${escapeHtml(email)} will no longer receive product update emails from MP MedPharma.</p>`
  );
}
