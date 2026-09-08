import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { safeDb } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SITE_SETTINGS_TAG } from "@/lib/publicData";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await safeDb((db) => db.siteSetting.findMany()) ?? [];
  const obj = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return NextResponse.json(obj);
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    await Promise.all(
      Object.entries(body).map(([key, value]) =>
        safeDb((db) => db.siteSetting.upsert({
          where: { key },
          create: { key, value: String(value) },
          update: { value: String(value) },
        }))
      )
    );
    // Header/footer settings are cached for the public shop — refresh them.
    revalidateTag(SITE_SETTINGS_TAG, { expire: 0 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
