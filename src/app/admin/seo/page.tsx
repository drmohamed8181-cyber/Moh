"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Search } from "lucide-react";

export default function AdminSeoPage() {
  const [form, setForm] = useState({ seoTitle: "", seoDescription: "", seoKeywords: "" });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setForm({
          seoTitle: data.seoTitle ?? "",
          seoDescription: data.seoDescription ?? "",
          seoKeywords: data.seoKeywords ?? "",
        });
      })
      .finally(() => setInitialLoading(false));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) toast.success("SEO settings saved successfully");
      else toast.error("Failed to save SEO settings");
    } catch {
      toast.error("Failed to save SEO settings");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm";

  if (initialLoading) {
    return <div className="text-sm text-gray-400">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">SEO Settings</h1>
        <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-60">
          <Save size={16} />{loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border p-6 max-w-2xl">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-5">
          <Search size={18} className="text-primary-600" /> Default Site Metadata
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          These control the default page title, description, and keywords search engines and social previews see across the site. Individual pages (products, categories) set their own titles and override these where applicable.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Site Title</label>
            <input
              type="text"
              value={form.seoTitle}
              onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
              className={inputClass}
              placeholder="MP MedPharma – Premium Medical Equipment"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Description</label>
            <textarea
              rows={3}
              value={form.seoDescription}
              onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
              className={inputClass + " resize-none"}
              placeholder="Shop premium medical equipment for hospitals, clinics, and home healthcare..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Keywords</label>
            <input
              type="text"
              value={form.seoKeywords}
              onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
              className={inputClass}
              placeholder="medical equipment, hospital supplies, diagnostic tools"
            />
            <p className="text-xs text-gray-400 mt-1.5">Separate keywords with commas.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
