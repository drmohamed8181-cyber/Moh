"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import {
  Search, User, Menu, X, ChevronDown,
  Heart, Phone, Mail, LogOut, Settings, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlistStore";

const defaultNav = [
  { id: "1", label: "Home", href: "/", children: [] },
  {
    id: "2", label: "Products", href: "/products",
    children: [
      { id: "2a", label: "All Products", href: "/products" },
      { id: "2b", label: "New Arrivals", href: "/products?sort=newest" },
      { id: "2c", label: "Featured", href: "/products?featured=true" },
    ],
  },
  { id: "3", label: "Categories", href: "/categories", children: [] },
  { id: "4", label: "About Us", href: "/about", children: [] },
  { id: "5", label: "Contact", href: "/contact", children: [] },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { data: session } = useSession();
  const loadWishlist = useWishlistStore((s) => s.load);
  const resetWishlist = useWishlistStore((s) => s.reset);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (session?.user) loadWishlist();
    else resetWishlist();
  }, [session, loadWishlist, resetWishlist]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-primary-700 text-white text-xs py-2 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-6">
            <a href="tel:9293498569" className="flex items-center gap-1.5 hover:text-primary-200 transition-colors">
              <Phone size={12} /><span>929-349-8569</span>
            </a>
            <a href="mailto:dr.mohamed8181@gmail.com" className="flex items-center gap-1.5 hover:text-primary-200 transition-colors">
              <Mail size={12} /><span>dr.mohamed8181@gmail.com</span>
            </a>
          </div>
          <div className="flex gap-4 text-xs">
            <Link href="/account/orders" className="hover:text-primary-200 transition-colors">Track Order</Link>
            <span className="text-primary-400">|</span>
            <Link href="/contact" className="hover:text-primary-200 transition-colors">Support</Link>
          </div>
        </div>
      </div>

      {/* Main header — floating frosted glass */}
      <div className={cn("sticky z-50 transition-all duration-300", isScrolled ? "top-2" : "top-4")}>
        <header
          className={cn(
            "container mx-auto px-4 transition-all duration-300"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between h-16 md:h-[70px] rounded-2xl px-4 md:px-6 backdrop-blur-xl border transition-all duration-300",
              isScrolled
                ? "bg-white/85 border-white/60 shadow-lg shadow-primary-900/10"
                : "bg-white/70 border-white/50 shadow-md shadow-primary-900/5"
            )}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-sm shadow-primary-600/30 transition-transform duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-sm">MP</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-lg font-bold text-primary-700 leading-tight">MP MedPharma</div>
                <div className="text-xs text-gray-500 leading-tight">Medical Equipment</div>
              </div>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {defaultNav.map((item) => (
                <div
                  key={item.id}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(item.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50/80 rounded-xl transition-all duration-200"
                  >
                    {item.label}
                    {item.children.length > 0 && <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />}
                  </Link>
                  <AnimatePresence>
                    {item.children.length > 0 && activeDropdown === item.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50/80 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <Search size={20} />
              </button>

              {/* Wishlist */}
              <Link
                href="/account/wishlist"
                className="p-2.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50/80 rounded-xl transition-all duration-200 hover:scale-105 hidden sm:flex"
              >
                <Heart size={20} />
              </Link>

              {/* User */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50/80 rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <User size={20} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-slide-down">
                    {session ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                        </div>
                        <Link href="/account" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">
                          <User size={14} /> My Account
                        </Link>
                        <Link href="/account/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">
                          <Package size={14} /> My Orders
                        </Link>
                        {["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER"].includes(session.user.role) && (
                          <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">
                            <Settings size={14} /> Admin Panel
                          </Link>
                        )}
                        <hr className="my-1" />
                        <button
                          onClick={() => signOut()}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">
                          Sign In
                        </Link>
                        <Link href="/register" className="block px-4 py-2.5 text-sm text-primary-600 font-medium hover:bg-primary-50">
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                className="lg:hidden p-2 text-gray-600 hover:text-primary-600 rounded-lg"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden container mx-auto px-4 mt-2">
            <nav className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg py-4 flex flex-col gap-1 animate-slide-down">
              {defaultNav.map((item) => (
                <div key={item.id}>
                  <Link
                    href={item.href}
                    className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children.map((child) => (
                    <Link
                      key={child.id}
                      href={child.href}
                      className="block px-8 py-2 text-sm text-gray-600 hover:text-primary-600"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))}
              <hr className="my-2" />
              {session ? (
                <>
                  <Link href="/account" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50 rounded-lg" onClick={() => setMobileOpen(false)}>My Account</Link>
                  <button onClick={() => signOut()} className="text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50 rounded-lg" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  <Link href="/register" className="block px-4 py-3 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg" onClick={() => setMobileOpen(false)}>Create Account</Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-start justify-center pt-24 px-4"
          onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-slide-up">
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, categories, brands..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800"
              />
              <button type="submit" className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium">
                Search
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">Popular:</span>
              {["Blood Pressure Monitor", "Pulse Oximeter", "ECG Machine", "Nebulizer"].map((term) => (
                <button
                  key={term}
                  onClick={() => { setSearchQuery(term); }}
                  className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
