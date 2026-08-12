"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Globe, Phone, Share2, type LucideIcon } from "lucide-react";

const defaultSettings = {
  companyName: "MP MedPharma",
  tagline: "Premium Medical Equipment",
  phone: "929-349-8569",
  email: "dr.mohamed8181@gmail.com",
  address: "New York, NY 10001, USA",
  facebook: "",
  twitter: "",
  instagram: "",
  linkedin: "",
  youtube: "",
  footerText: "© MP MedPharma. All Rights Reserved.",
};

type Settings = typeof defaultSettings;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setSettings((prev) => ({ ...prev, ...data })))
      .finally(() => setInitialLoading(false));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm";

  const Section = ({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border p-6 mb-5">
      <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-5">
        <Icon size={18} className="text-primary-600" />{title}
      </h2>
      {children}
    </div>
  );

  if (initialLoading) {
    return <div className="text-sm text-gray-400">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-60">
          <Save size={16} />{loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <Section title="General" icon={Globe}>
        <div className="grid sm:grid-cols-2 gap-4">
          {([
            { key: "companyName", label: "Company Name" },
            { key: "tagline", label: "Tagline" },
          ] as const).map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input type="text" value={settings[key]} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} className={inputClass} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Contact Information" icon={Phone}>
        <div className="grid sm:grid-cols-2 gap-4">
          {([
            { key: "phone", label: "Phone" },
            { key: "email", label: "Email" },
            { key: "address", label: "Address" },
          ] as const).map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input type="text" value={settings[key]} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} className={inputClass} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Social Media" icon={Share2}>
        <div className="grid sm:grid-cols-2 gap-4">
          {(["facebook", "twitter", "instagram", "linkedin", "youtube"] as const).map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 capitalize">{key}</label>
              <input type="url" value={settings[key]} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} className={inputClass} placeholder={`https://${key}.com/...`} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Footer" icon={Globe}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Footer Copyright Text</label>
          <input type="text" value={settings.footerText} onChange={(e) => setSettings({ ...settings, footerText: e.target.value })} className={inputClass} />
        </div>
      </Section>
    </div>
  );
}
