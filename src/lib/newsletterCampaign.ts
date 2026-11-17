// One-off inventory newsletter to people who actually reached out to us:
// anyone who sent an inquiry (website form or logged email), newsletter
// subscribers, and customers who registered an account themselves. Customer
// records imported in bulk (no inquiry, no signup) are never mailed. Content is in src/content/newsletterCampaign.ts.
//
// Compliance: every email carries a working unsubscribe link (recorded in
// EmailOptOut, which every marketing send checks), the business postal
// address (in the template footer) and no prices. Opted-out and internal
// addresses are never mailed, and CampaignSend makes sure each address gets a
// campaign once.
import { safeDb } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { containsPrice, redactPrices } from "@/lib/priceGuard";
import { INFO_EMAIL } from "@/lib/emailSignature";
import { buildProductDigestEmail, type DigestProduct } from "@/lib/productDigest";
import { createUnsubscribeToken } from "@/lib/unsubscribe";
import { isSold } from "@/lib/partnerStock";
import { SITE_URL } from "@/lib/seo";
import { NEWSLETTER_CAMPAIGN } from "@/content/newsletterCampaign";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM = process.env.NEWSLETTER_FROM_EMAIL || process.env.INQUIRY_FROM_EMAIL || process.env.SMTP_FROM;

/** Our own and our partner's addresses: never part of a customer campaign. */
function isInternal(email: string) {
  return (
    email.endsWith("@mpmedpharma.com") ||
    email.endsWith("@laserlocators.com") ||
    email === "dr.mohamed8181@gmail.com" ||
    email === "mpmedpharma@gmail.com"
  );
}

export function unsubscribeUrl(email: string) {
  return `${SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${createUnsubscribeToken(email)}`;
}

export async function getCampaignAudience() {
  const [users, messages, subscribers, optOuts, sent] = await Promise.all([
    safeDb((db) => db.user.findMany({ where: { role: "CUSTOMER", password: { not: null } }, select: { email: true } })),
    safeDb((db) => db.contactMessage.findMany({ select: { email: true } })),
    safeDb((db) => db.newsletter.findMany({ select: { email: true } })),
    safeDb((db) => db.emailOptOut.findMany({ select: { email: true } })),
    safeDb((db) => db.campaignSend.findMany({ where: { campaign: NEWSLETTER_CAMPAIGN.id }, select: { email: true } })),
  ]);
  if (!users || !messages || !subscribers || !optOuts || !sent) return null;

  const all = new Set<string>();
  for (const row of [...users, ...messages, ...subscribers]) {
    const email = row.email?.trim().toLowerCase();
    if (email && EMAIL_RE.test(email) && !isInternal(email)) all.add(email);
  }
  const optedOut = new Set(optOuts.map((o) => o.email.trim().toLowerCase()));
  const alreadySent = new Set(sent.map((s) => s.email));
  const eligible = [...all].filter((e) => !optedOut.has(e));
  const pending = eligible.filter((e) => !alreadySent.has(e)).sort();

  return { eligible: eligible.length, optedOut: [...all].filter((e) => optedOut.has(e)).length, sent: alreadySent.size, pending };
}

const PRODUCT_SELECT = {
  name: true,
  slug: true,
  sku: true,
  manufacturer: true,
  shortDesc: true,
  features: true,
  images: true,
  isAvailable: true,
  stockQty: true,
  specifications: true,
  category: { select: { name: true, slug: true } },
} as const;

async function loadProducts(slugs: string[]) {
  const rows = await safeDb((db) => db.product.findMany({ where: { slug: { in: slugs } }, select: PRODUCT_SELECT }));
  const bySlug = new Map((rows ?? []).filter((p) => p.isAvailable && !isSold(p)).map((p) => [p.slug, p]));
  return slugs.flatMap((slug) => {
    const p = bySlug.get(slug);
    if (!p) return [];
    const specs = (p.specifications as Record<string, string> | null) ?? null;
    const product: DigestProduct = {
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      category: p.category?.name ?? null,
      manufacturer: p.manufacturer,
      shortDescription: p.shortDesc ? redactPrices(p.shortDesc) : p.shortDesc,
      features: p.features.filter((f) => !containsPrice(f)),
      images: NEWSLETTER_CAMPAIGN.hideImageSlugs.includes(p.slug) ? [] : p.images,
      isAvailable: p.isAvailable,
      stock: p.stockQty,
      isFeatured: p.slug === NEWSLETTER_CAMPAIGN.featuredSlug,
      specifications: specs
        ? Object.fromEntries(Object.entries(specs).filter(([k, v]) => !containsPrice(k) && !containsPrice(String(v)) && !/price|cost/i.test(k)))
        : null,
    };
    return [product];
  });
}

export async function buildCampaignEmail(email: string) {
  const [newProducts, updatedProducts] = await Promise.all([
    loadProducts([NEWSLETTER_CAMPAIGN.featuredSlug, ...NEWSLETTER_CAMPAIGN.newSlugs]),
    loadProducts(NEWSLETTER_CAMPAIGN.updatedSlugs),
  ]);
  return buildProductDigestEmail({
    newProducts,
    updatedProducts,
    baseUrl: SITE_URL,
    unsubscribeUrl: unsubscribeUrl(email),
    issueDate: new Date(),
    mode: "announcement",
  });
}

async function sendOne(email: string) {
  const { subject, html, text } = await buildCampaignEmail(email);
  const unsub = unsubscribeUrl(email);
  return sendMail({
    to: email,
    from: FROM,
    replyTo: INFO_EMAIL,
    subject,
    html,
    text,
    headers: { "List-Unsubscribe": `<${unsub}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Sends the campaign to up to `limit` people who haven't had it yet. */
export async function sendCampaignBatch(limit: number) {
  const audience = await getCampaignAudience();
  if (!audience) return null;
  let sent = 0;
  let failed = 0;
  for (const email of audience.pending.slice(0, limit)) {
    const ok = await sendOne(email);
    if (ok) {
      sent += 1;
      await safeDb((db) => db.campaignSend.create({ data: { campaign: NEWSLETTER_CAMPAIGN.id, email } }));
    } else {
      failed += 1;
    }
    await sleep(550); // stay under the email provider's rate limit
  }
  return { sent, failed, remaining: Math.max(audience.pending.length - sent, 0) };
}

/** A copy to the business inbox, so the owner sees exactly what customers will get. */
export async function sendCampaignTest() {
  return sendOne(INFO_EMAIL);
}
