export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { safeDb } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Calendar, Mail, Phone, Building2, MapPin, ChevronRight } from "lucide-react";

export const metadata: Metadata = { title: "Demo Requests – Admin" };

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">
      {label}
    </span>
  );
}

export default async function AdminDemoRequestsPage() {
  const requests = await safeDb((db) => db.demoRequest.findMany({ orderBy: { createdAt: "desc" } })) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demo Requests</h1>
          <p className="text-gray-500 text-sm">{requests.length} total request{requests.length === 1 ? "" : "s"}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500">No demo requests yet.</p>
            <p className="text-gray-400 text-sm mt-1">Submissions from &ldquo;Request a Private Demo&rdquo; will appear here.</p>
          </div>
        ) : (
          <div className="divide-y">
            {requests.map((r) => (
              <div key={r.id} className="p-5 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{r.fullName}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                      <a href={`mailto:${r.email}`} className="flex items-center gap-1 hover:text-primary-600">
                        <Mail size={13} /> {r.email}
                      </a>
                      {r.phone && (
                        <a href={`tel:${r.phone}`} className="flex items-center gap-1 hover:text-primary-600">
                          <Phone size={13} /> {r.phone}
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">{formatDate(r.createdAt)}</p>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-primary-600 font-medium mb-3">
                  <ChevronRight size={14} />
                  {r.productName}
                </div>

                {(r.organization || r.cityState) && (
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    {r.organization && (
                      <span className="flex items-center gap-1.5">
                        <Building2 size={14} className="text-gray-400" /> {r.organization}
                      </span>
                    )}
                    {r.cityState && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-400" /> {r.cityState}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  {r.role && <Tag label={r.role} />}
                  {r.demoFormat && <Tag label={r.demoFormat} />}
                  {r.contactMethod && <Tag label={`Prefers ${r.contactMethod}`} />}
                  {r.interest && <Tag label={r.interest} />}
                </div>

                {r.message && (
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3">{r.message}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
