import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { safeDb } from "@/lib/prisma";
import Badge from "@/components/ui/Badge";
import Image from "next/image";
import CustomerEditModal from "@/components/admin/CustomerEditModal";
import CustomerSearchBar from "@/components/admin/CustomerSearchBar";
import { ArrowUp, ArrowDown } from "lucide-react";

type SortKey = "name" | "state" | "joined";

const DEFAULT_ORDER: Record<SortKey, "asc" | "desc"> = { name: "asc", state: "asc", joined: "desc" };

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ sort?: string; order?: string; q?: string }> }) {
  const sp = await searchParams;
  const sort: SortKey = sp.sort === "name" || sp.sort === "state" ? sp.sort : "joined";
  const order: "asc" | "desc" = sp.order === "asc" || sp.order === "desc" ? sp.order : DEFAULT_ORDER[sort];
  const q = sp.q?.trim() ?? "";

  const where: Prisma.UserWhereInput = { role: "CUSTOMER" };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { organization: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { addresses: { some: { OR: [
        { street: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { state: { contains: q, mode: "insensitive" } },
        { zip: { contains: q, mode: "insensitive" } },
      ] } } },
    ];
  }

  const customers = await safeDb((db) => db.user.findMany({
    where,
    include: {
      _count: { select: { orders: true } },
      addresses: { where: { isDefault: true }, take: 1 },
    },
  })) ?? [];

  const sorted = [...customers].sort((a, b) => {
    let result = 0;
    if (sort === "name") {
      result = (a.name ?? "").localeCompare(b.name ?? "");
    } else if (sort === "state") {
      result = (a.addresses[0]?.state ?? "").localeCompare(b.addresses[0]?.state ?? "");
    } else {
      result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return order === "asc" ? result : -result;
  });

  const sortHref = (key: SortKey) => {
    const nextOrder = sort === key ? (order === "asc" ? "desc" : "asc") : DEFAULT_ORDER[key];
    const params = new URLSearchParams();
    params.set("sort", key);
    params.set("order", nextOrder);
    if (q) params.set("q", q);
    return `/admin/customers?${params.toString()}`;
  };

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <Link href={sortHref(sortKey)} className="inline-flex items-center gap-1 hover:text-slate-600 transition-colors">
      {label}
      {sort === sortKey && (order === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
    </Link>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Customers</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {customers.length} {customers.length === 1 ? "customer" : "customers"}{q && ` matching "${q}"`}
        </p>
      </div>

      <CustomerSearchBar />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider"><SortHeader label="Customer" sortKey="name" /></th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Organization</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider"><SortHeader label="Address" sortKey="state" /></th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Phone</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Orders</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider"><SortHeader label="Joined" sortKey="joined" /></th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sorted.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400">{q ? `No customers match "${q}"` : "No customers yet"}</td></tr>
              ) : (
                sorted.map((customer) => {
                  const address = customer.addresses[0];
                  return (
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
                      <td className="px-5 py-3.5 text-sm text-slate-700">{customer.organization ?? "—"}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">
                        {address ? (
                          <span>{[address.street, address.city, address.state, address.zip].filter(Boolean).join(", ")}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{customer.phone ?? "—"}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-700 font-medium">{customer._count.orders}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-400">{new Date(customer.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={customer.isActive ? "green" : "red"}>
                          {customer.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <CustomerEditModal
                          customer={{
                            id: customer.id,
                            name: customer.name,
                            organization: customer.organization,
                            addresses: customer.addresses,
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
