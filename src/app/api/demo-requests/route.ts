import { NextRequest, NextResponse } from "next/server";
import { safeDb } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const {
      productName,
      productSlug,
      fullName,
      email,
      phone,
      organization,
      cityState,
      role,
      demoFormat,
      contactMethod,
      interest,
      message,
      consent,
    } = await req.json();

    if (!productName || typeof productName !== "string") {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }
    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ error: "Consent is required" }, { status: 400 });
    }

    await safeDb((db) =>
      db.demoRequest.create({
        data: {
          productName: productName.trim(),
          productSlug: productSlug?.trim() || null,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone?.trim() || null,
          organization: organization?.trim() || null,
          cityState: cityState?.trim() || null,
          role: role?.trim() || null,
          demoFormat: demoFormat?.trim() || null,
          contactMethod: contactMethod?.trim() || null,
          interest: interest?.trim() || null,
          message: message?.trim() || null,
          consent: Boolean(consent),
        },
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
