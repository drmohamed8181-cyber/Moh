import { NextRequest, NextResponse } from "next/server";
import { safeDb } from "@/lib/prisma";
import { verifyStockAlertToken } from "@/lib/stockAlerts";

// The "Cancel this request" link in stock-alert emails. Removes that one alert.

function htmlPage(body: string) {
  return new NextResponse(
    `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;text-align:center;padding:60px 20px;">${body}</body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  const email = (req.nextUrl.searchParams.get("email") ?? "").toLowerCase();
  const token = req.nextUrl.searchParams.get("token") ?? "";

  if (!id || !email || !token || !verifyStockAlertToken(id, email, token)) {
    return htmlPage(`<h2>Invalid or expired link</h2>`);
  }

  await safeDb((db) => db.stockAlert.deleteMany({ where: { id, email } }));
  return htmlPage(`<h2>Request cancelled</h2><p>We won't email you about this product.</p>`);
}
