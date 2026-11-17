import { NextRequest, NextResponse } from "next/server";
import { OPT_IN_COUNTRIES } from "@/lib/euCountries";

// Whether the visitor's country needs an explicit marketing opt-in.
// Vercel sets x-vercel-ip-country from the visitor's IP; only that flag is returned.
export async function GET(req: NextRequest) {
  const country = req.headers.get("x-vercel-ip-country")?.slice(0, 2).toUpperCase() || "";
  return NextResponse.json(
    { optIn: OPT_IN_COUNTRIES.has(country) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
