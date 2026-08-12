import { safeDb } from "@/lib/prisma";
import Badge from "@/components/ui/Badge";
import Image from "next/image";

export default async function AdminCustomersPage() {
  const customers = await safeDb((db) => db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  })) ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Customers</h1>
        <p className="text-slate-400 text-sm mt-0.5">{customers.length} registered customers</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Customer", "Phone", "Orders", "Joined", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {customers.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">No customers yet</td></tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0 overflow-hidden">
                          {customer.image ? (
                            <Image src={customer.image} alt="" width={36} height={36} className="w-full h-full object-cover" />
                          ) : (
                            customer.name?.[0]?.toUpperCase() ?? "?"
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{customer.name ?? "—"}</p>
                          <p className="text-xs text-slate-400">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{customer.phone ?? "—"}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-700 font-medium">{customer._count.orders}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{new Date(customer.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={customer.isActive ? "green" : "red"}>
                        {customer.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
