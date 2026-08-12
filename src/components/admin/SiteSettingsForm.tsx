"use client";

import { useState } from "react";
import { Save, CheckCircle } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface SiteSettingsFormProps {
  settings: Record<string, string>;
}

export default function SiteSettingsForm({ settings: initial }: SiteSettingsFormProps) {
  const [settings, setSettings] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (key: string, value: string) => setSettings((s) => ({ ...s, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-600">
          <CheckCircle className="w-4 h-4" /> Settings saved successfully!
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Company Information</h2>
        <div className="space-y-4">
          <Input label="Company Name" value={settings.companyName} onChange={(e) => set("companyName", e.target.value)} />
          <Input label="Logo URL" value={settings.logo} onChange={(e) => set("logo", e.target.value)} placeholder="https://…" />
          <Input label="Phone" value={settings.phone} onChange={(e) => set("phone", e.target.value)} />
          <Input label="Email" type="email" value={settings.email} onChange={(e) => set("email", e.target.value)} />
          <Input label="Address" value={settings.address} onChange={(e) => set("address", e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Social Media</h2>
        <div className="space-y-4">
          {["facebook", "twitter", "instagram", "linkedin", "youtube"].map((key) => (
            <Input key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={settings[key] ?? ""} onChange={(e) => set(key, e.target.value)} placeholder="https://…" />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-800 mb-4">About Section</h2>
        <div className="space-y-4">
          <Input label="Section Title" value={settings.aboutTitle} onChange={(e) => set("aboutTitle", e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              rows={4}
              value={settings.aboutDescription}
              onChange={(e) => set("aboutDescription", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>
          <Input label="About Image URL" value={settings.aboutImage} onChange={(e) => set("aboutImage", e.target.value)} placeholder="https://…" />
        </div>
      </div>

      <Button onClick={handleSave} loading={saving} size="lg">
        <Save className="w-4 h-4 mr-2" /> Save Settings
      </Button>
    </div>
  );
}
