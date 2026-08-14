import { NextRequest, NextResponse } from "next/server";
import { safeDb } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { buildProductDigestEmail, type DigestProduct } from "@/lib/productDigest";
import { createUnsubscribeToken } from "@/lib/unsubscribe";
import { HIDDEN_CATEGORY_SLUGS } from "@/lib/specialties";

const SETTING_KEY = "lastProductDigestAt";
const DEFAULT_LOOKBACK_MS = 14 * 24 * 60 * 60 * 1000; // biweekly
const MAX_PRODUCTS = 50;

const DIGEST_SELECT = {
  name: true,
  slug: true,
  sku: true,
  manufacturer: true,
  shortDesc: true,
  features: true,
  images: true,
  isAvailable: true,
  stockQty: true,
  isFeatured: true,
  specifications: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { name: true } },
} as const;

function toDigestProduct(p: {
  name: string;
  slug: string;
  sku: string;
  manufacturer: string | null;
  shortDesc: string | null;
  features: string[];
  images: string[];
  isAvailable: boolean;
  stockQty: number;
  isFeatured: boolean;
  specifications: unknown;
  category: { name: string } | null;
}): DigestProduct {
  return {
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    category: p.category?.name ?? null,
    manufacturer: p.manufacturer,
    shortDescription: p.shortDesc,
    features: p.features,
    images: p.images,
    isAvailable: p.isAvailable,
    stock: p.stockQty,
    isFeatured: p.isFeatured,
    specifications: (p.specifications as Record<string, string> | null) ?? null,
  };
}

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const lastRun = await safeDb((db) => db.siteSetting.findUnique({ where: { key: SETTING_KEY } }));
  const since = lastRun ? new Date(lastRun.value) : new Date(now.getTime() - DEFAULT_LOOKBACK_MS);

  const [newRows, updatedRows] = await Promise.all([
    safeDb((db) =>
      db.product.findMany({
        where: { isAvailable: true, createdAt: { gt: since }, category: { slug: { notIn: HIDDEN_CATEGORY_SLUGS } } },
        orderBy: { createdAt: "desc" },
        take: MAX_PRODUCTS,
        select: DIGEST_SELECT,
      })
    ),
    safeDb((db) =>
      db.product.findMany({
        where: { isAvailable: true, updatedAt: { gt: since }, createdAt: { lte: since }, category: { slug: { notIn: HIDDEN_CATEGORY_SLUGS } } },
        orderBy: { updatedAt: "desc" },
        take: MAX_PRODUCTS,
        select: DIGEST_SELECT,
      })
    ),
  ]);

  const newProducts = (newRows ?? []).map(toDigestProduct);
  const updatedProducts = (updatedRows ?? []).map(toDigestProduct);

  if (newProducts.length === 0 && updatedProducts.length === 0) {
    await safeDb((db) => db.siteSetting.upsert({
      where: { key: SETTING_KEY },
      update: { value: now.toISOString() },
      create: { key: SETTING_KEY, value: now.toISOString() },
    }));
    return NextResponse.json({ productsFound: 0, sent: 0 });
  }

  const subscribers = await safeDb((db) => db.newsletter.findMany({ select: { email: true } }));
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || req.nextUrl.origin;

  let sent = 0;
  let failed = 0;
  for (const { email } of subscribers ?? []) {
    const token = createUnsubscribeToken(email);
    const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
    const { subject, html, text } = buildProductDigestEmail({
      newProducts,
      updatedProducts,
      baseUrl,
      unsubscribeUrl,
      issueDate: now,
    });
    const ok = await sendMail({ to: email, subject, html, text });
    if (ok) sent++;
    else failed++;
  }

  await safeDb((db) => db.siteSetting.upsert({
    where: { key: SETTING_KEY },
    update: { value: now.toISOString() },
    create: { key: SETTING_KEY, value: now.toISOString() },
  }));

  return NextResponse.json({
    newProducts: newProducts.length,
    updatedProducts: updatedProducts.length,
    subscribers: subscribers?.length ?? 0,
    sent,
    failed,
  });
}
