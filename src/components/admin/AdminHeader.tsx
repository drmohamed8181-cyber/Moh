"use client";

import Link from "next/link";
import { Bell, ExternalLink } from "lucide-react";

export default function AdminHeader() {
  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" /> View Store
        </Link>
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
