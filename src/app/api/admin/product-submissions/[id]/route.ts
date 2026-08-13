import { NextRequest, NextResponse } from "next/server";
import type { SubmissionStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";

const VALID_STATUSES: SubmissionStatus[] = ["NEW", "REVIEWING", "ACCEPTED", "DECLINED"];

async function checkAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  return ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"].includes(role ?? "");
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const data: { status?: SubmissionStatus; adminNotes?: string | null } = {};
  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status as SubmissionStatus;
  }
  if (body.adminNotes !== undefined) {
    data.adminNotes = typeof body.adminNotes === "string" ? body.adminNotes.trim() || null : null;
  }

  const submission = await safeDb((db) => db.productSubmission.update({ where: { id }, data }));
  if (!submission) return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
  return NextResponse.json(submission);
}
