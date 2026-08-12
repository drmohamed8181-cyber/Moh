import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  sku: z.string().min(1),
  categoryId: z.string(),
  brandId: z.string().optional().nullable(),
  manufacturer: z.string().optional().nullable(),
  price: z.number().positive(),
  discountPrice: z.number().positive().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  specifications: z.record(z.string(), z.string()).optional().nullable(),
  features: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  stock: z.number().int().min(0),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  weight: z.number().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  warranty: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

async function checkAdmin() {
  const session = await auth();
  if (!session?.user) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session.user as any).role;
  return ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"].includes(role ?? "");
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  try {
    const body = await req.json();
    const data = schema.parse(body);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const product = await prisma.product.create({ data: data as any });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues }, { status: 400 });
    if ((error as { code?: string }).code === "P2002") return NextResponse.json({ error: "SKU or slug already exists." }, { status: 409 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
