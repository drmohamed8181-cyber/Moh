export const dynamic = "force-dynamic";
import { Metadata } from "next";
import Link from "next/link";
import { safeDb } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Package, Mail, Phone, ChevronRight } from "lucide-react";

export const metadata: Metadata = { title: "Product Submissions – Admin" };

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-primary-50 text-primary-700",
  REVIEWING: "bg-gold-50 text-gold-700",
  ACCEPTED: "bg-green-50 text-green-700",
  DECLINED: "bg-red-50 text-red-700",
};

export default async function AdminProductSubmissionsPage() {
  const submissions = await safeDb((db) => db.productSubmission.findMany({ orderBy: { createdAt: "desc" } })) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Submissions</h1>
          <p className="text-gray-500 text-sm">{submissions.length} total submission{submissions.length === 1 ? "" : "s"}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        {submissions.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500">No product submissions yet.</p>
            <p className="text-gray-400 text-sm mt-1">Submissions from &ldquo;Sell Your Product&rdquo; will appear here.</p>
          </div>
        ) : (
          <div className="divide-y">
            {submissions.map((s) => (
              <Link key={s.id} href={`/admin/product-submissions/${s.id}`} className="block p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-gray-900">{s.productName}</p>
                      <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_STYLES[s.status]}`}>
                        {s.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{s.referenceNumber}</p>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">{formatDate(s.createdAt)}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                  <span>{s.fullName}</span>
                  <span className="flex items-center gap-1"><Mail size={13} /> {s.email}</span>
                  <span className="flex items-center gap-1"><Phone size={13} /> {s.phone}</span>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-primary-600 font-medium">
                  {s.category} · {s.manufacturer} · {s.condition}
                  <ChevronRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
