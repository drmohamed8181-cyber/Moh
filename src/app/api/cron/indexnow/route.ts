import { NextRequest, NextResponse } from "next/server";
import { getAllPublicUrls } from "@/lib/siteUrls";
import { submitToIndexNow } from "@/lib/indexnow";
import { SITE_URL } from "@/lib/seo";

// Tells Bing (and so DuckDuckGo, Yahoo, Ecosia and Copilot search) what this
// site publishes, without anyone needing a webmaster account. Scheduled in
// vercel.json; see src/lib/indexnow.ts for why this is worth having.

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let urls: string[];
  try {
    urls = await getAllPublicUrls();
  } catch {
    // The catalogue reads throw when the database is unreachable. Report it
    // rather than submitting a truncated list that says the site shrank.
    return NextResponse.json({ error: "Catalogue unavailable" }, { status: 503 });
  }

  const result = await submitToIndexNow(urls, new URL(SITE_URL).host);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
