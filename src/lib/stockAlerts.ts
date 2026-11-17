// "Notify me when available" emails.
//
// A visitor on a sold or unavailable product page leaves their email
// (src/app/api/stock-alert). Once a day the lead-followups cron calls
// sendBackInStockAlerts(): every pending alert whose product is listed again
// (available and not sold against the partner list) gets one email, and
// notifiedAt is set so it is never sent twice.
import { safeDb } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { isSold } from "@/lib/partnerStock";
import { createUnsubscribeToken, verifyUnsubscribeToken } from "@/lib/unsubscribe";
import { INFO_EMAIL, infoSignatureHtml, infoSignatureText } from "@/lib/emailSignature";
import { escapeHtml } from "@/lib/utils";
import { SITE_URL } from "@/lib/seo";

export const STOCK_ALERT_LEAD_SOURCE = "Back-in-stock alert";

// Owner's rule: emails to customers about our inventory go out from info@.
const FROM = `MP MedPharma <${INFO_EMAIL}>`;

/** The token in an alert's cancel link, tied to that one alert. */
export function stockAlertToken(alertId: string, email: string) {
  return createUnsubscribeToken(`${email}#${alertId}`);
}

export function verifyStockAlertToken(alertId: string, email: string, token: string) {
  return verifyUnsubscribeToken(`${email}#${alertId}`, token);
}

export function stockAlertCancelUrl(alertId: string, email: string) {
  const params = new URLSearchParams({ id: alertId, email, token: stockAlertToken(alertId, email) });
  return `${SITE_URL}/api/stock-alert/unsubscribe?${params.toString()}`;
}

/** Whether a product counts as back in stock for an alert. */
export function isBackInStock(product: { isAvailable: boolean; slug: string; category?: { slug: string } | null }) {
  return product.isAvailable && !isSold(product);
}

export async function sendBackInStockAlerts(): Promise<{ due: number; sent: number }> {
  const pending = await safeDb((db) =>
    db.stockAlert.findMany({
      where: { notifiedAt: null, product: { isAvailable: true } },
      select: {
        id: true,
        email: true,
        name: true,
        product: { select: { name: true, slug: true, isAvailable: true, category: { select: { slug: true } } } },
      },
      take: 200,
    }),
  );
  const due = (pending ?? []).filter((a) => isBackInStock(a.product));
  let sent = 0;

  for (const alert of due) {
    const productUrl = `${SITE_URL}/products/${alert.product.slug}`;
    const cancelUrl = stockAlertCancelUrl(alert.id, alert.email);
    const greeting = alert.name ? `Hello ${alert.name.split(" ")[0]},` : "Hello,";

    const ok = await sendMail({
      to: alert.email,
      from: FROM,
      replyTo: INFO_EMAIL,
      subject: `Back in inventory: ${alert.product.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
          <p style="color:#333;line-height:1.6;">${escapeHtml(greeting)}</p>
          <p style="color:#333;line-height:1.6;">You asked us to let you know when the <strong>${escapeHtml(alert.product.name)}</strong> became available. It is listed in our inventory again.</p>
          <p style="margin:20px 0;"><a href="${productUrl}" style="background:#0a2540;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">View the listing</a></p>
          <p style="color:#333;line-height:1.6;">Units like this often sell quickly. Reply to this email for a quote or any questions.</p>
          ${infoSignatureHtml}
          <p style="color:#999;font-size:12px;margin-top:24px;">This is the one email you asked for; we won't send more about this product. <a href="${cancelUrl}" style="color:#999;">Remove my request</a></p>
        </div>`,
      text: `${greeting}\n\nYou asked us to let you know when the ${alert.product.name} became available. It is listed in our inventory again:\n${productUrl}\n\nUnits like this often sell quickly. Reply to this email for a quote or any questions.\n\n${infoSignatureText}\n\nThis is the one email you asked for; we won't send more about this product. Remove my request: ${cancelUrl}`,
    });

    if (ok) {
      sent += 1;
      await safeDb((db) => db.stockAlert.update({ where: { id: alert.id }, data: { notifiedAt: new Date() } }));
    }
  }

  return { due: due.length, sent };
}
