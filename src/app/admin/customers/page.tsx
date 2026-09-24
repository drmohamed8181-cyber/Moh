import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { getSalesByUser } from "@/lib/customers";
import { safeDb } from "@/lib/prisma";
import Badge from "@/components/ui/Badge";
import Image from "next/image";
import CustomerEditModal from "@/components/admin/CustomerEditModal";
import CustomerSearchBar from "@/components/admin/CustomerSearchBar";
import CustomerListControls from "@/components/admin/CustomerListControls";
import { ArrowUp, ArrowDown } from "lucide-react";

type SortKey = "name" | "state" | "joined" | "orders" | "sales";
type Order = "asc" | "desc";
type CustomerType = "BUYER" | "SELLER" | "BOTH";

const DEFAULT_ORDER: Record<SortKey, Order> = { name: "asc", state: "asc", joined: "desc", orders: "desc", sales: "desc" };

// Presets offered in the "Sort by" menu, as (column, direction).
const PRESETS: Record<string, [SortKey, Order]> = {
  newest: ["joined", "desc"],
  oldest: ["joined", "asc"],
  "name-asc": ["name", "asc"],
  "name-desc": ["name", "desc"],
  orders: ["orders", "desc"],
  sales: ["sales", "desc"],
};

const TYPE_BADGE: Record<CustomerType, { label: string; variant: "blue" | "yellow" | "gray" }> = {
  BUYER: { label: "Buyer", variant: "blue" },
  SELLER: { label: "Seller", variant: "yellow" },
  BOTH: { label: "Buyer & Seller", variant: "gray" },
};

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function sortHref(key: SortKey, sort: SortKey, order: Order, keep: Record<string, string>) {
  const nextOrder = sort === key ? (order === "asc" ? "desc" : "asc") : DEFAULT_ORDER[key];
  const params = new URLSearchParams();
  params.set("sort", key);
  params.set("order", nextOrder);
  for (const [k, v] of Object.entries(keep)) if (v) params.set(k, v);
  return `/admin/customers?${params.toString()}`;
}

function SortHeader({ label, sortKey, sort, order, keep }: { label: string; sortKey: SortKey; sort: SortKey; order: Order; keep: Record<string, string> }) {
  return (
    <Link href={sortHref(sortKey, sort, order, keep)} className="inline-flex items-center gap-1 hover:text-slate-600 transition-colors">
      {label}
      {sort === sortKey && (order === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
    </Link>
  );
}

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ sort?: string; order?: string; q?: string; type?: string }> }) {
  const sp = await searchParams;
  // Column headers send sort=<column>&order=…; the "Sort by" menu sends a preset name.
  const isColumn = sp.sort === "name" || sp.sort === "state" || sp.sort === "joined" || sp.sort === "orders" || sp.sort === "sales";
  const preset = !isColumn && sp.sort ? PRESETS[sp.sort] : undefined;
  const sort: SortKey = isColumn ? (sp.sort as SortKey) : preset ? preset[0] : "joined";
  const order: Order = sp.order === "asc" || sp.order === "desc" ? sp.order : preset ? preset[1] : DEFAULT_ORDER[sort];
  const sortValue = Object.entries(PRESETS).find(([, [k, o]]) => k === sort && o === order)?.[0] ?? `${sort}-${order}`;
  const q = sp.q?.trim() ?? "";
  const type = sp.type === "BUYER" || sp.type === "SELLER" || sp.type === "BOTH" ? sp.type : "";
  const keep = { q, type };

  const where: Prisma.UserWhereInput = { role: "CUSTOMER" };
  if (type) where.customerType = type;
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
      _count: { select: { orders: true, accounts: true } },
      addresses: { where: { isDefault: true }, take: 1 },
    },
  })) ?? [];

  // Lightweight list of every customer for the search dropdown.
  const allCustomers = await safeDb((db) => db.user.findMany({
    where: { role: "CUSTOMER" },
    select: { id: true, name: true, email: true, organization: true, image: true },
    orderBy: { name: "asc" },
  })) ?? [];

  const salesByUser = await getSalesByUser(customers.map((c) => c.id));
  const salesOf = (id: string) => salesByUser.get(id) ?? 0;

  const sorted = [...customers].sort((a, b) => {
    let result = 0;
    if (sort === "orders") {
      result = a._count.orders - b._count.orders;
    } else if (sort === "sales") {
      result = salesOf(a.id) - salesOf(b.id);
    } else if (sort === "name") {
      result = (a.name ?? "").localeCompare(b.name ?? "");
    } else if (sort === "state") {
      result = (a.addresses[0]?.state ?? "").localeCompare(b.addresses[0]?.state ?? "");
    } else {
      result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return order === "asc" ? result : -result;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Customers</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {customers.length} {customers.length === 1 ? "customer" : "customers"}{q && ` matching "${q}"`}
        </p>
      </div>

      <CustomerSearchBar customers={allCustomers} />
      <CustomerListControls sortValue={sortValue} type={type} />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider"><SortHeader label="Customer" sortKey="name" sort={sort} order={order} keep={keep} /></th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Organization</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider"><SortHeader label="Address" sortKey="state" sort={sort} order={order} keep={keep} /></th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Phone</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider"><SortHeader label="Orders" sortKey="orders" sort={sort} order={order} keep={keep} /></th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider"><SortHeader label="Total Sales" sortKey="sales" sort={sort} order={order} keep={keep} /></th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider"><SortHeader label="Joined" sortKey="joined" sort={sort} order={order} keep={keep} /></th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sorted.length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-slate-400">{q || type ? "No customers match these filters" : "No customers yet"}</td></tr>
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
                            <p className="text-sm font-medium text-slate-800 flex flex-wrap items-center gap-1.5">
                              {customer.name ?? "—"}
                              <Badge variant={TYPE_BADGE[customer.customerType].variant}>{TYPE_BADGE[customer.customerType].label}</Badge>
                            </p>
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
                      <td className="px-5 py-3.5 text-sm text-slate-700 font-medium whitespace-nowrap">{formatUsd(salesOf(customer.id))}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-400">{new Date(customer.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={customer.isActive ? "green" : "red"}>
                            {customer.isActive ? "Active" : "Disabled"}
                          </Badge>
                          {!customer.password && customer._count.accounts === 0 && (
                            <Badge variant="yellow" className="whitespace-nowrap">From message</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <CustomerEditModal
                          customer={{
                            id: customer.id,
                            name: customer.name,
                            organization: customer.organization,
                            customerType: customer.customerType,
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
