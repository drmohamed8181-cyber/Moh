"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, Loader2 } from "lucide-react";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribing(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      if (res.ok) {
        toast.success("You're subscribed! Thanks for joining our newsletter.");
        setNewsletterEmail("");
      } else {
        toast.error("Please enter a valid email address.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">MP</span>
              </div>
              <div>
                <div className="text-white font-bold text-lg leading-tight">MP MedPharma</div>
                <div className="text-xs text-gray-500 leading-tight">Medical Equipment</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Providing premium medical equipment for healthcare professionals and home users since 2010. Quality, reliability, and innovation in every product.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Youtube, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a key={i} href={href}
                  className="w-9 h-9 bg-gray-800 hover:bg-primary-600 text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Products", href: "/products" },
                { label: "Categories", href: "/categories" },
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary-600 rounded-full" />{label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Customer Service</h3>
            <ul className="space-y-3">
              {[
                { label: "FAQ", href: "/faq" },
                { label: "Shipping Policy", href: "/shipping" },
                { label: "Return Policy", href: "/returns" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms & Conditions", href: "/terms" },
                { label: "Track Order", href: "/account/orders" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary-600 rounded-full" />{label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Contact Us</h3>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <Phone size={15} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <a href="tel:9293498569" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                  929-349-8569
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={15} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:dr.mohamed8181@gmail.com" className="text-sm text-gray-400 hover:text-primary-400 transition-colors break-all">
                  dr.mohamed8181@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">New York, NY 10001, USA</span>
              </li>
            </ul>

            <h4 className="text-white text-sm font-semibold mb-3">Newsletter</h4>
            <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Your email"
                className="min-w-0 flex-1 px-3 py-2 bg-gray-800 text-sm text-gray-200 rounded-lg border border-gray-700 focus:outline-none focus:border-primary-500 placeholder:text-gray-500"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="shrink-0 whitespace-nowrap px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
              >
                {subscribing && <Loader2 size={14} className="animate-spin" />}
                {subscribing ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} MP MedPharma. All Rights Reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-400 transition-colors">Terms</Link>
            <Link href="/sitemap" className="text-xs text-gray-500 hover:text-gray-400 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
