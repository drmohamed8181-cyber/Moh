import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NEWSLETTER_CAMPAIGN } from "@/content/newsletterCampaign";
import { buildCampaignEmail, getCampaignAudience, sendCampaignBatch, sendCampaignTest } from "@/lib/newsletterCampaign";
import { INFO_EMAIL } from "@/lib/emailSignature";

// Admin → Newsletter. GET: audience counts and a preview. POST: send a test to
// info@, or send the next batch to customers. Only admins (not content
// managers) can send.
export const maxDuration = 60;
const BATCH = 15;

async function role() {
  const session = await auth();
  return (session?.user as { role?: string })?.role ?? "";
}

export async function GET() {
  if (!["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"].includes(await role())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const audience = await getCampaignAudience();
  if (!audience) return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  const preview = await buildCampaignEmail(INFO_EMAIL);
  return NextResponse.json({
    campaign: { id: NEWSLETTER_CAMPAIGN.id, title: NEWSLETTER_CAMPAIGN.title },
    eligible: audience.eligible,
    optedOut: audience.optedOut,
    sent: audience.sent,
    pending: audience.pending.length,
    subject: preview.subject,
    html: preview.html,
  });
}

export async function POST(req: NextRequest) {
  if (!["SUPER_ADMIN", "ADMIN"].includes(await role())) {
    return NextResponse.json({ error: "Only admins can send the newsletter." }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  if (body.action === "test") {
    const ok = await sendCampaignTest();
    return ok ? NextResponse.json({ success: true }) : NextResponse.json({ error: "Test email failed to send" }, { status: 500 });
  }
  if (body.action === "send" && body.confirm === NEWSLETTER_CAMPAIGN.id) {
    const result = await sendCampaignBatch(BATCH);
    if (!result) return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    return NextResponse.json(result);
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
