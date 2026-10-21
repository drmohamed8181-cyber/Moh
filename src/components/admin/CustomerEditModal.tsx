"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, X } from "lucide-react";
import CustomerDeleteButton from "@/components/admin/CustomerDeleteButton";

type Customer = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  isActive: boolean;
  orderCount: number;
  organization: string | null;
  customerType: "BUYER" | "SELLER" | "BOTH";
  addresses: { street: string; city: string; state: string; zip: string; country: string }[];
};

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";
const labelClass = "block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5";

/** "Edit" link for a customer row, or an "Add customer" button when no customer is passed. */
export default function CustomerEditModal({ customer }: { customer?: Customer }) {
  const router = useRouter();
  const id = useId();
  const isNew = !customer;
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const address = customer?.addresses[0];
  const initial = () => ({
    name: customer?.name ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    isActive: customer?.isActive ?? true,
    organization: customer?.organization ?? "",
    customerType: customer?.customerType ?? ("BUYER" as Customer["customerType"]),
    street: address?.street ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    zip: address?.zip ?? "",
    country: address?.country ?? "US",
  });
  const [form, setForm] = useState(initial);
  const set = <K extends keyof ReturnType<typeof initial>>(key: K, value: ReturnType<typeof initial>[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const openDialog = () => {
    setForm(initial());
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { street, city, state, zip, country, ...fields } = form;
      const hasAddress = street || city || state || zip;
      const res = await fetch(isNew ? "/api/admin/customers" : `/api/admin/customers/${customer.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          ...(hasAddress ? { address: { street, city, state, zip, country } } : {}),
        }),
      });
      if (res.ok) {
        toast.success(isNew ? "Customer added" : "Customer updated");
        close();
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? (isNew ? "Failed to add customer" : "Failed to update customer"));
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openDialog}
        aria-label={isNew ? undefined : `Edit ${customer.name || customer.email}`}
        className={
          isNew
            ? "flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            : "text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
        }
      >
        {isNew && <UserPlus size={16} />}
        {isNew ? "Add customer" : "Edit"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-title`}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto text-left"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 id={`${id}-title`} className="font-semibold text-slate-900">
                {isNew ? "Add Customer" : "Edit Customer"}
              </h2>
              <button type="button" onClick={close} aria-label="Close" className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor={`${id}-name`} className={labelClass}>Name</label>
                <input id={`${id}-name`} autoFocus value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
              </div>

              <div>
                <label htmlFor={`${id}-email`} className={labelClass}>Email</label>
                <input
                  id={`${id}-email`}
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`${id}-phone`} className={labelClass}>Phone</label>
                  <input id={`${id}-phone`} type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor={`${id}-type`} className={labelClass}>Type</label>
                  <select
                    id={`${id}-type`}
                    value={form.customerType}
                    onChange={(e) => set("customerType", e.target.value as Customer["customerType"])}
                    className={`${inputClass} bg-white`}
                  >
                    <option value="BUYER">Buyer</option>
                    <option value="SELLER">Seller</option>
                    <option value="BOTH">Buyer &amp; Seller</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor={`${id}-org`} className={labelClass}>Organization Name</label>
                <input
                  id={`${id}-org`}
                  value={form.organization}
                  onChange={(e) => set("organization", e.target.value)}
                  placeholder="e.g. City General Hospital"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={`${id}-street`} className={labelClass}>Street Address</label>
                <input id={`${id}-street`} value={form.street} onChange={(e) => set("street", e.target.value)} className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`${id}-city`} className={labelClass}>City</label>
                  <input id={`${id}-city`} value={form.city} onChange={(e) => set("city", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor={`${id}-state`} className={labelClass}>State</label>
                  <input id={`${id}-state`} value={form.state} onChange={(e) => set("state", e.target.value)} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`${id}-zip`} className={labelClass}>ZIP Code</label>
                  <input id={`${id}-zip`} value={form.zip} onChange={(e) => set("zip", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor={`${id}-country`} className={labelClass}>Country</label>
                  <input id={`${id}-country`} value={form.country} onChange={(e) => set("country", e.target.value)} className={inputClass} />
                </div>
              </div>

              {!isNew && (
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => set("isActive", e.target.checked)}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  Active (unchecked disables the account&apos;s sign-in)
                </label>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                {!isNew ? (
                  <CustomerDeleteButton customer={customer} variant="button" onDeleted={() => setOpen(false)} />
                ) : <span />}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={close}
                    className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60"
                  >
                    {saving ? "Saving..." : isNew ? "Add Customer" : "Save Changes"}
                  </button>
                </div>
              </div>
              {!isNew && customer.orderCount > 0 && (
                <p className="text-xs text-slate-400">
                  This customer has orders, so they can&apos;t be deleted. Uncheck Active to disable them instead.
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
