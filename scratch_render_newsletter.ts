import { PrismaClient } from '@prisma/client';
import { buildProductDigestEmail, type DigestProduct } from './src/lib/productDigest';
import fs from 'fs';

const prisma = new PrismaClient();

function toDigest(p: any): DigestProduct {
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
    specifications: p.specifications,
  };
}

(async () => {
  const select = {
    name: true, slug: true, sku: true, manufacturer: true, shortDesc: true,
    features: true, images: true, isAvailable: true, stockQty: true, isFeatured: true,
    specifications: true, createdAt: true, updatedAt: true,
    category: { select: { name: true } },
  } as const;

  const all = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { updatedAt: 'desc' },
    take: 12,
    select,
  });

  // Simulate: top 4 most-recently-touched as "new", next 4 as "updated"
  const newProducts = all.slice(0, 4).map(toDigest);
  const updatedProducts = all.slice(4, 8).map(toDigest);

  const baseUrl = 'https://www.mpmedpharma.com';
  const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?email=preview%40example.com&token=preview-token`;

  const { subject, previewText, html, text } = buildProductDigestEmail({
    newProducts,
    updatedProducts,
    baseUrl,
    unsubscribeUrl,
    issueDate: new Date('2026-08-12'),
  });

  fs.writeFileSync('newsletter-preview.html', html, 'utf-8');
  fs.writeFileSync('newsletter-preview.txt', text, 'utf-8');
  console.log(JSON.stringify({ subject, previewText, newCount: newProducts.length, updatedCount: updatedProducts.length }, null, 2));
  await prisma.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
