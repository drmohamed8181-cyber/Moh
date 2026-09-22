"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match.");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error ?? "Failed to update password.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <form onSubmit={handlePasswordSubmit} className="bg-white rounded-2xl border p-6 space-y-4">
      <h2 className="font-semibold text-gray-900">Change Password</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
        <input required type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
          <input required type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
          <input required type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>
      <button type="submit" disabled={savingPassword} className="px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60">
        {savingPassword ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
