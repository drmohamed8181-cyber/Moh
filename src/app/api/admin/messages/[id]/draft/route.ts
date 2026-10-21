import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";
import { buildReplyDraft, inquiryProductRef } from "@/lib/replyDraft";

async function checkAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  return ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"].includes(role ?? "");
}

const PRODUCT_SELECT = { name: true, retailPrice: true, isAvailable: true } as const;

// A suggested reply for the admin to review; nothing is sent from here.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const message = await safeDb((db) => db.contactMessage.findUnique({ where: { id } }));
  if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // The link line is the reliable match; the product name is the fallback when the customer edited it out.
  const ref = inquiryProductRef(message.message);
  const found = ref.slug
    ? await safeDb((db) => db.product.findUnique({ where: { slug: ref.slug! }, select: PRODUCT_SELECT }))
    : ref.name
      ? await safeDb((db) => db.product.findFirst({ where: { name: { equals: ref.name!, mode: "insensitive" } }, select: PRODUCT_SELECT }))
      : null;

  const product = found
    ? { name: found.name, endUserPrice: found.retailPrice, isAvailable: found.isAvailable }
    : null;

  return NextResponse.json({
    draft: buildReplyDraft({ name: message.name, product, similar: ref.similar }),
    product,
    similar: ref.similar,
  });
}
