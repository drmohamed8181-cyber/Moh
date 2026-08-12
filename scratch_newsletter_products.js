const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const products = await prisma.$queryRawUnsafe(`
    SELECT p.id, p.name, p.slug, p.sku, p.manufacturer, p."shortDescription", p.description,
           p.features, p.images, p."isAvailable", p.stock, p."isFeatured",
           p.specifications, p."createdAt", p."updatedAt", c.name as category
    FROM "Product" p
    LEFT JOIN "Category" c ON c.id = p."categoryId"
    ORDER BY p."updatedAt" DESC
    LIMIT 30
  `);
  console.log(JSON.stringify(products, null, 2));
  await prisma.$disconnect();
})().catch(e => { console.error(e.message); process.exit(1); });
