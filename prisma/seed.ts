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

  // Categories
  const categoryData = [
    { name: "Patient Monitoring", slug: "patient-monitoring", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=500&q=80", order: 1 },
    { name: "Diagnostic Equipment", slug: "diagnostic-equipment", image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=500&q=80", order: 2 },
    { name: "Laboratory Equipment", slug: "laboratory-equipment", image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=500&q=80", order: 3 },
    { name: "Surgical Instruments", slug: "surgical-instruments", image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=500&q=80", order: 4 },
    { name: "Hospital Furniture", slug: "hospital-furniture", image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=500&q=80", order: 5 },
    { name: "Home Healthcare", slug: "home-healthcare", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80", order: 6 },
  ];

  for (const cat of categoryData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("Categories seeded");

  const diagnosticCat = await prisma.category.findUnique({ where: { slug: "diagnostic-equipment" } });
  const monitoringCat = await prisma.category.findUnique({ where: { slug: "patient-monitoring" } });
  const homeCat = await prisma.category.findUnique({ where: { slug: "home-healthcare" } });

  if (diagnosticCat && monitoringCat && homeCat) {
    const products = [
      {
        name: "Digital Blood Pressure Monitor Pro",
        slug: "digital-bp-monitor-pro",
        sku: "BP-001",
        categoryId: diagnosticCat.id,
        brand: "MedTech Pro",
        price: 89.99,
        discountPrice: 69.99,
        images: ["https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80"],
        shortDesc: "Clinical-grade accuracy with 60-memory storage and irregular heartbeat detection.",
        isAvailable: true,
        stockQty: 25,
        isFeatured: true,
        warranty: "2 Years",
        features: ["WHO blood pressure classification", "IHB detection", "60-reading memory", "Auto power-off"],
      },
      {
        name: "Fingertip Pulse Oximeter",
        slug: "fingertip-pulse-oximeter",
        sku: "OX-001",
        categoryId: diagnosticCat.id,
        brand: "OxyPro",
        price: 45.99,
        discountPrice: null,
        images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80"],
        shortDesc: "Real-time SpO₂ and pulse rate with bright OLED display.",
        isAvailable: true,
        stockQty: 50,
        isFeatured: true,
        warranty: "1 Year",
        features: ["OLED display", "SpO₂ & pulse rate", "Auto power-off", "Lanyard included"],
      },
      {
        name: "Infrared Forehead Thermometer",
        slug: "infrared-forehead-thermometer",
        sku: "TH-001",
        categoryId: diagnosticCat.id,
        brand: "ThermoScan",
        price: 39.99,
        discountPrice: 29.99,
        images: ["https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80"],
        shortDesc: "Non-contact 1-second thermometer for all ages.",
        isAvailable: true,
        stockQty: 75,
        isFeatured: true,
        warranty: "1 Year",
        features: ["Non-contact", "1-second reading", "Fever alert", "32-reading memory"],
      },
      {
        name: "Multi-Parameter Patient Monitor",
        slug: "multi-parameter-patient-monitor",
        sku: "PM-001",
        categoryId: monitoringCat.id,
        brand: "VitalGuard",
        price: 2499.99,
        discountPrice: 1999.99,
        images: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&q=80"],
        shortDesc: "ECG, SpO₂, NIBP, temperature monitoring in one compact unit.",
        isAvailable: true,
        stockQty: 12,
        isFeatured: true,
        warranty: "2 Years",
        features: ["5-parameter monitoring", "Touchscreen display", "Data export", "Alarm system"],
      },
      {
        name: "Medical Mesh Nebulizer",
        slug: "medical-mesh-nebulizer",
        sku: "NB-001",
        categoryId: homeCat.id,
        brand: "BreathEasy",
        price: 79.99,
        discountPrice: 59.99,
        images: ["https://images.unsplash.com/photo-1631815590058-860e4d65b977?w=800&q=80"],
        shortDesc: "Silent mesh nebulizer, portable and rechargeable.",
        isAvailable: true,
        stockQty: 30,
        isFeatured: true,
        warranty: "1 Year",
        features: ["Silent operation", "Rechargeable battery", "5-min medication time", "Auto shutoff"],
      },
    ];

    for (const p of products) {
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: {},
        create: p,
      });
    }
    console.log("Products seeded");
  }

  // Hero slides
  const heroSlides = [
    { title: "Digital Blood Pressure Monitor", description: "Clinical-grade accuracy with instant readings and smart memory.", image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1200&q=80", buttonText: "Shop Now", buttonLink: "/products", order: 0, isActive: true },
    { title: "Pulse Oximeter", description: "Real-time SpO₂ and pulse rate monitoring with OLED display.", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&q=80", buttonText: "Explore", buttonLink: "/products", order: 1, isActive: true },
    { title: "Patient Monitor Systems", description: "Multi-parameter monitoring for critical care environments.", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200&q=80", buttonText: "View Products", buttonLink: "/products", order: 2, isActive: true },
  ];

  for (const slide of heroSlides) {
    await prisma.heroSlide.create({ data: slide }).catch(() => {});
  }
  console.log("Hero slides seeded");

  // Site settings
  const siteSettings = [
    { key: "companyName", value: "MP MedPharma" },
    { key: "phone", value: "929-349-8569" },
    { key: "email", value: "dr.mohamed8181@gmail.com" },
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
