import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null };

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes("YOUR_PASSWORD")) return null;
  try {
    return new PrismaClient({ log: [] });
  } catch {
    return null;
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function safeDb<T>(fn: (db: PrismaClient) => Promise<T>): Promise<T | null> {
  if (!prisma) return null;
  try {
    return await fn(prisma);
  } catch (e) {
    console.error("DB error:", e);
    return null;
  }
}
