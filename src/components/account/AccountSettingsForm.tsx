"use client";

import { useState } from "react";
import { toast } from "sonner";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";

export default function AccountSettingsForm({ initialName, initialPhone }: { initialName: string; initialPhone: string }) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [savingProfile, setSavingProfile] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/account/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (res.ok) toast.success("Profile updated.");
      else toast.error("Failed to update profile.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Profile Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <button type="submit" disabled={savingProfile} className="px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60">
          {savingProfile ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <ChangePasswordForm />
    </div>
  );
}
