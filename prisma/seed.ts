import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "dr.mohamed8181@gmail.com" },
    update: {},
    create: {
      name: "Dr. Mohamed",
      email: "dr.mohamed8181@gmail.com",
      password: adminPassword,
      role: "SUPER_ADMIN",
    },
  });
  console.log("Admin created:", admin.email);

  // Categories, products, and hero slides are managed live via the admin
  // panel and mirror the real refurbished ophthalmic equipment catalog
  // (matched against laserlocators.com) — not seeded here to avoid
  // reintroducing stale placeholder data.

  // Site settings
  const siteSettings = [
    { key: "companyName", value: "MP MedPharma" },
    { key: "phone", value: "929-349-8569" },
    { key: "email", value: "info@mpmedpharma.com" },
    { key: "address", value: "New York, NY 10001, USA" },
    { key: "footerText", value: "© MP MedPharma. All Rights Reserved." },
  ];

  for (const s of siteSettings) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
  }
  console.log("Settings seeded");

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
