import { NextRequest, NextResponse } from "next/server";
import { safeDb } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { INFO_EMAIL, infoSignatureHtml, infoSignatureText } from "@/lib/emailSignature";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { escapeHtml } from "@/lib/utils";
import { saveContactAsCustomer } from "@/lib/customers";
import { SITE_URL } from "@/lib/seo";
import { STOCK_ALERT_LEAD_SOURCE, isBackInStock, stockAlertCancelUrl } from "@/lib/stockAlerts";

// "Notify me when available" on a sold or unavailable product page. Saves the
// request, logs it as a lead (someone waiting for this exact unit is a buyer),
// confirms by email and tells staff. The daily cron sends the alert itself.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INQUIRY_FROM_EMAIL = process.env.INQUIRY_FROM_EMAIL || process.env.SMTP_FROM;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!checkRateLimit(`stock-alert:${ip}`, 10, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const email = clean(body.email, 200).toLowerCase();
    const name = clean(body.name, 120);
    const productId = clean(body.productId, 64);
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const product = await safeDb((db) =>
      db.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, slug: true, isAvailable: true, category: { select: { slug: true } } },
      }),
    );
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    if (isBackInStock(product)) {
      return NextResponse.json({ error: "This product is available now. Use Inquire Now for a quote." }, { status: 409 });
    }

    const existing = await safeDb((db) =>
      db.stockAlert.findUnique({ where: { productId_email: { productId: product.id, email } }, select: { id: true, notifiedAt: true } }),
    );
    const alert = existing
      ? await safeDb((db) => db.stockAlert.update({ where: { id: existing.id }, data: { notifiedAt: null, ...(name ? { name } : {}) } }))
      : await safeDb((db) => db.stockAlert.create({ data: { productId: product.id, email, name: name || null } }));
    if (!alert) return NextResponse.json({ error: "Internal server error" }, { status: 500 });

    // Already waiting for this unit: nothing new to log or email.
    if (existing && !existing.notifiedAt) return NextResponse.json({ success: true });

    const country = req.headers.get("x-vercel-ip-country")?.slice(0, 2).toUpperCase() || null;
    await safeDb((db) =>
      db.contactMessage.create({
        data: {
          name: name || email,
          email,
          workLocation: country,
          subject: `Notify me when available: ${product.name}`,
          message: `Asked to be emailed when the ${product.name} is available again.${country ? `\nVisitor's country: ${country}` : ""}`,
          source: STOCK_ALERT_LEAD_SOURCE,
        },
      }),
    );
    try {
      await saveContactAsCustomer({ name, email });
    } catch (error) {
      console.error("Failed to save stock-alert requester as customer", error);
    }

    const productUrl = `${SITE_URL}/products/${product.slug}`;
    const cancelUrl = stockAlertCancelUrl(alert.id, email);

    await sendMail({
      to: email,
      from: INQUIRY_FROM_EMAIL,
      replyTo: INFO_EMAIL,
      subject: `We'll let you know: ${product.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
          <p style="color:#333;line-height:1.6;">Thank you${name ? `, ${escapeHtml(name.split(" ")[0])}` : ""}. We'll email you once when the <a href="${productUrl}">${escapeHtml(product.name)}</a> is available again.</p>
          <p style="color:#333;line-height:1.6;">Need a unit sooner? Reply to this email and we'll check similar equipment for you.</p>
          ${infoSignatureHtml}
          <p style="color:#999;font-size:12px;margin-top:24px;">Changed your mind? <a href="${cancelUrl}" style="color:#999;">Cancel this request</a></p>
        </div>`,
      text: `Thank you${name ? `, ${name.split(" ")[0]}` : ""}. We'll email you once when the ${product.name} is available again:\n${productUrl}\n\nNeed a unit sooner? Reply to this email and we'll check similar equipment for you.\n\n${infoSignatureText}\n\nCancel this request: ${cancelUrl}`,
    });

    await sendMail({
      to: INFO_EMAIL,
      internal: true,
      replyTo: email,
      subject: `Notify-me request: ${product.name} — ${name || email}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="color:#0a2540;">New "notify me when available" request</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Product</td><td><a href="${productUrl}">${escapeHtml(product.name)}</a></td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Name</td><td>${escapeHtml(name || "—")}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Email</td><td>${escapeHtml(email)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Country</td><td>${escapeHtml(country ?? "—")}</td></tr>
          </table>
          <p style="color:#333;">They'll be emailed automatically when the unit is listed again. Reply to offer something similar now.</p>
        </div>`,
      text: `New "notify me when available" request\nProduct: ${product.name} (${productUrl})\nName: ${name || "—"}\nEmail: ${email}\nCountry: ${country ?? "—"}\n\nThey'll be emailed automatically when the unit is listed again. Reply to offer something similar now.`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
