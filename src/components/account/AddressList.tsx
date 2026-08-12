"use client";

import { useState } from "react";
import { MapPin, Plus, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  label: string;
  isDefault: boolean;
}

const emptyForm = { name: "", phone: "", street: "", city: "", state: "", zip: "", country: "US", label: "Home", isDefault: false };

export default function AddressList({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses((prev) => {
          const next = form.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
          return [data.address, ...next];
        });
        setForm(emptyForm);
        setShowForm(false);
        toast.success("Address saved.");
      } else {
        toast.error(data.error ?? "Failed to save address.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const prev = addresses;
    setAddresses((cur) => cur.filter((a) => a.id !== id));
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setAddresses(prev);
      toast.error("Failed to remove address.");
    }
  };

  const handleSetDefault = async (id: string) => {
    const prev = addresses;
    setAddresses((cur) => cur.map((a) => ({ ...a, isDefault: a.id === id })));
    const res = await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    if (!res.ok) {
      setAddresses(prev);
      toast.error("Failed to update default address.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "Add Address"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
            <input required value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
              <input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Zip Code</label>
              <input required value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Label</label>
              <select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>Home</option>
                <option>Work</option>
                <option>Other</option>
              </select>
            </div>
            <label className="flex items-center gap-2 mt-7 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="rounded border-gray-300 text-primary-600" />
              Set as default address
            </label>
          </div>
          <button type="submit" disabled={saving} className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60">
            {saving ? "Saving..." : "Save Address"}
          </button>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl border p-16 text-center">
          <MapPin size={40} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">You haven&apos;t added any addresses yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border p-5 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">{a.label}</span>
                {a.isDefault && (
                  <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> Default
                  </span>
                )}
              </div>
              <p className="font-semibold text-gray-900 text-sm">{a.name}</p>
              <p className="text-sm text-gray-600 mt-1">{a.street}</p>
              <p className="text-sm text-gray-600">{a.city}, {a.state} {a.zip}</p>
              <p className="text-sm text-gray-500 mt-1">{a.phone}</p>
              <div className="flex items-center gap-3 mt-4">
                {!a.isDefault && (
                  <button onClick={() => handleSetDefault(a.id)} className="text-xs font-medium text-primary-600 hover:underline">
                    Set as default
                  </button>
                )}
                <button onClick={() => handleDelete(a.id)} className="text-xs font-medium text-red-600 hover:underline inline-flex items-center gap-1 ml-auto">
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
