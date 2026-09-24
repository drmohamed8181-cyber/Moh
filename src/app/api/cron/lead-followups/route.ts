import { NextRequest, NextResponse } from "next/server";
import { safeDb } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { escapeHtml } from "@/lib/utils";
import { DAY_MS, FOLLOW_UP_DAYS, HOUR_MS, NEW_LEAD_REMINDER_HOURS } from "@/lib/leads";

// Daily check (13:00 UTC, about 9am US Eastern; Vercel Hobby allows one run a day).
// Emails the business once per lead when:
// - a new customer message (not one staff sent) has had no reply or status change for NEW_LEAD_REMINDER_HOURS, or
// - a quote has had no status change for FOLLOW_UP_DAYS.
const RECIPIENT = process.env.LEAD_DIGEST_EMAIL || "info@mpmedpharma.com";

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

type Lead = { id: string; name: string; email: string; subject: string; age: string };

function ago(ms: number) {
  const hours = Math.floor(ms / HOUR_MS);
  if (hours < 48) return `${hours} hours`;
  return `${Math.floor(ms / DAY_MS)} days`;
}

function section(title: string, leads: Lead[]) {
  if (leads.length === 0) return { html: "", text: "" };
  const rows = leads
    .map(
      (l) => `<tr>
        <td style="padding:8px 12px 8px 0;border-top:1px solid #eee;"><strong>${escapeHtml(l.name)}</strong><br/><span style="color:#667;font-size:12px;">${escapeHtml(l.email)}</span></td>
        <td style="padding:8px 12px 8px 0;border-top:1px solid #eee;">${escapeHtml(l.subject)}</td>
        <td style="padding:8px 0;border-top:1px solid #eee;color:#b45309;white-space:nowrap;">${l.age}</td>
      </tr>`,
    )
    .join("");
  return {
    html: `<h3 style="color:#0a2540;margin:24px 0 8px;">${title} (${leads.length})</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>`,
    text: `${title} (${leads.length})\n${leads.map((l) => `- ${l.name} <${l.email}>: ${l.subject} (${l.age})`).join("\n")}\n`,
  };
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const newCutoff = new Date(now.getTime() - NEW_LEAD_REMINDER_HOURS * HOUR_MS);
  const quoteCutoff = new Date(now.getTime() - FOLLOW_UP_DAYS * DAY_MS);

  const rows = await safeDb((db) =>
    db.contactMessage.findMany({
      where: {
        OR: [
          { leadStatus: "NEW", reply: null, sentByAdmin: false, reminderSentAt: null, createdAt: { lte: newCutoff } },
          { leadStatus: "QUOTED", OR: [{ statusUpdatedAt: { lte: quoteCutoff } }, { statusUpdatedAt: null, createdAt: { lte: quoteCutoff } }] },
        ],
      },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, subject: true, leadStatus: true, statusUpdatedAt: true, reminderSentAt: true, createdAt: true },
    }),
  );
  if (!rows) return NextResponse.json({ error: "Database unavailable" }, { status: 500 });

  // A quote is reminded once per status change.
  const due = rows.filter(
    (m) => m.leadStatus === "NEW" || !m.reminderSentAt || (m.statusUpdatedAt && m.reminderSentAt < m.statusUpdatedAt),
  );
  const toLead = (m: (typeof due)[number], since: Date): Lead => ({
    id: m.id,
    name: m.name.trim(),
    email: m.email,
    subject: m.subject,
    age: ago(now.getTime() - since.getTime()),
  });
  const unanswered = due.filter((m) => m.leadStatus === "NEW").map((m) => toLead(m, m.createdAt));
  const followUps = due.filter((m) => m.leadStatus === "QUOTED").map((m) => toLead(m, m.statusUpdatedAt ?? m.createdAt));

  if (due.length === 0) return NextResponse.json({ unanswered: 0, followUps: 0, sent: false });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || req.nextUrl.origin;
  const fresh = section(`No reply after ${NEW_LEAD_REMINDER_HOURS} hours`, unanswered.map((l) => ({ ...l, age: `waiting ${l.age}` })));
  const quiet = section("Quotes to follow up", followUps.map((l) => ({ ...l, age: `quoted ${l.age} ago` })));
  const subject = [
    unanswered.length && `${unanswered.length} ${unanswered.length === 1 ? "message" : "messages"} waiting for a reply`,
    followUps.length && `${followUps.length} ${followUps.length === 1 ? "quote" : "quotes"} to follow up`,
  ].filter(Boolean).join(", ");

  const sent = await sendMail({
    to: RECIPIENT,
    internal: true,
    subject: `Reminder: ${subject}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
        <h2 style="color:#0a2540;">Leads waiting on you</h2>
        ${fresh.html}
        ${quiet.html}
        <p style="margin-top:24px;"><a href="${baseUrl}/admin/messages" style="background:#0a2540;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;">Open Messages</a></p>
        <p style="color:#999;font-size:12px;margin-top:24px;">You get one reminder per lead. Set a status (Quoted, Won or Lost) on the Messages page once you've responded.</p>
      </div>`,
    text: `Leads waiting on you\n\n${fresh.text}\n${quiet.text}\nOpen Messages: ${baseUrl}/admin/messages\n`,
  });

  // Only mark as reminded once the email actually went out, so a failure retries on the next run.
  if (sent) {
    await safeDb((db) => db.contactMessage.updateMany({ where: { id: { in: due.map((m) => m.id) } }, data: { reminderSentAt: now } }));
  }

  return NextResponse.json({ unanswered: unanswered.length, followUps: followUps.length, sent });
}
