"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Package, Tags, ShoppingBag, Users,
  MessageSquare, Image, Home, Settings, Search,
  LogOut, ChevronRight, Globe, Calendar, PackageSearch, KeyRound,
  Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/ui/Logo";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Demo Requests", href: "/admin/demo-requests", icon: Calendar },
  { label: "Product Submissions", href: "/admin/product-submissions", icon: PackageSearch },
  { label: "Media Library", href: "/admin/media", icon: Image },
  { label: "Homepage", href: "/admin/homepage", icon: Home },
  { label: "SEO", href: "/admin/seo", icon: Search },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Change Password", href: "/admin/password", icon: KeyRound },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <LogoMark className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-display font-semibold text-white text-sm leading-tight">MedPharma</p>
            <p className="text-xs text-gold-300 leading-tight">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                active
                  ? "bg-primary-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <Globe size={17} /> View Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={17} /> Sign Out
        </button>
      </div>
    </>
  );
}

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);

  // Close the mobile drawer with Escape and stop the page behind it from scrolling.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 bg-gray-900 text-white px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
          aria-expanded={open}
          aria-controls="admin-mobile-nav"
          className="p-2 -ml-2 rounded-lg hover:bg-gray-800"
        >
          <Menu size={22} />
        </button>
        <LogoMark className="w-8 h-8 rounded-full" />
        <p className="font-display font-semibold text-sm">MedPharma Admin</p>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside
            id="admin-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Admin menu"
            className="relative w-64 max-w-[80vw] h-full bg-gray-900 text-white flex flex-col overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close admin menu"
              autoFocus
              className="absolute top-4 right-3 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X size={20} />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-gray-900 text-white flex-col flex-shrink-0 min-h-screen">
        <SidebarContent />
      </aside>
    </>
  );
}
