const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const p = await prisma.$queryRawUnsafe(`SELECT id, name, slug, images FROM "Product" WHERE name ILIKE $1 OR name ILIKE $2 OR name ILIKE $3`, '%Infiniti%', '%Orbscan%', '%Hansatome%');
  console.log(JSON.stringify(p, null, 2));
  await prisma.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
