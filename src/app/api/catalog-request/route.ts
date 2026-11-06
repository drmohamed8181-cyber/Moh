import { NextRequest, NextResponse } from "next/server";
import { safeDb } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { INFO_EMAIL, infoSignatureHtml, infoSignatureText } from "@/lib/emailSignature";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { escapeHtml } from "@/lib/utils";
import { saveContactAsCustomer } from "@/lib/customers";
import { CATALOGS } from "@/lib/catalogs";
import { CATALOG_LINK_SOURCES, SOURCE_LABELS, catalogHref } from "@/lib/catalogDownloads";
import { SITE_URL } from "@/lib/seo";

// A catalog requested from a button on the website. The visitor gives their
// name, email and clinic; we save them as a lead (source "Catalog download")
// and as a customer, email them the catalog link, and send a copy to staff.
// The PDF itself stays open at /catalog/<file>.pdf: printed QR codes and
// shared links point there and must keep working without a form.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INQUIRY_FROM_EMAIL = process.env.INQUIRY_FROM_EMAIL || process.env.SMTP_FROM;
const LEAD_SOURCE = "Catalog download";

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!checkRateLimit(`catalog-request:${ip}`, 10, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const name = clean(body.name, 120);
    const email = clean(body.email, 200).toLowerCase();
    const organization = clean(body.organization, 200);
    const catalog = CATALOGS.find((c) => c.specialty === body.catalog);
    const src = clean(body.source, 20);
    const source = (CATALOG_LINK_SOURCES as readonly string[]).includes(src) ? src : null;

    if (!name || !organization || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Please enter your name, a valid email and your clinic or hospital." }, { status: 400 });
    }
    if (!catalog) return NextResponse.json({ error: "Unknown catalog" }, { status: 400 });

    // Vercel sets this from the visitor's IP; only the two-letter country is kept.
    const country = req.headers.get("x-vercel-ip-country")?.slice(0, 2).toUpperCase() || null;
    const where = source ? SOURCE_LABELS[source] ?? source : "the website";
    const message = `Requested the ${catalog.title} (PDF) from: ${where}.${country ? `\nVisitor's country: ${country}` : ""}`;

    const saved = await safeDb((db) => db.contactMessage.create({
      data: {
        name,
        email,
        organization,
        workLocation: country,
        subject: `Catalog request: ${catalog.name}`,
        message,
        source: LEAD_SOURCE,
      },
    }));
    if (!saved) return NextResponse.json({ error: "Internal server error" }, { status: 500 });

    try {
      await saveContactAsCustomer({ name, email, organization });
    } catch (error) {
      console.error("Failed to save catalog requester as customer", error);
    }

    const pdfUrl = `${SITE_URL}${catalogHref(catalog.href, "email")}`;
    const firstName = name.split(" ")[0];

    // The visitor gets the PDF on screen straight away; the email is a copy
    // to keep, so a failed send doesn't fail the request.
    await sendMail({
      to: email,
      from: INQUIRY_FROM_EMAIL,
      replyTo: INFO_EMAIL,
      subject: `Your ${catalog.title} — MP MedPharma`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="color:#0a2540;">Thank you, ${escapeHtml(firstName)}!</h2>
          <p style="color:#333;line-height:1.6;">Here is the MP MedPharma ${escapeHtml(catalog.title)}. It is built from our live inventory, so the link always opens the current version.</p>
          <p style="margin:20px 0;"><a href="${pdfUrl}" style="background:#0a2540;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Open the catalog (PDF)</a></p>
          <p style="color:#333;line-height:1.6;">Looking for a specific unit, or need a quote? Just reply to this email.</p>
          ${infoSignatureHtml}
        </div>`,
      text: `Thank you, ${firstName}!\n\nHere is the MP MedPharma ${catalog.title}. It is built from our live inventory, so the link always opens the current version:\n${pdfUrl}\n\nLooking for a specific unit, or need a quote? Just reply to this email.\n\n${infoSignatureText}`,
    });

    await sendMail({
      to: INFO_EMAIL,
      internal: true,
      replyTo: email,
      subject: `Catalog request: ${catalog.name} — ${name}, ${organization}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="color:#0a2540;">New catalog request</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Catalog</td><td>${escapeHtml(catalog.title)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Name</td><td>${escapeHtml(name)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Email</td><td>${escapeHtml(email)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Clinic</td><td>${escapeHtml(organization)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Country</td><td>${escapeHtml(country ?? "—")}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">From</td><td>${escapeHtml(where)}</td></tr>
          </table>
          <p style="color:#333;">They already have the catalog. Reply to this email to follow up.</p>
        </div>`,
      text: `New catalog request\nCatalog: ${catalog.title}\nName: ${name}\nEmail: ${email}\nClinic: ${organization}\nCountry: ${country ?? "—"}\nFrom: ${where}\n\nThey already have the catalog. Reply to this email to follow up.`,
    });

    return NextResponse.json({ success: true, href: catalogHref(catalog.href, source ?? "catalogs") });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
