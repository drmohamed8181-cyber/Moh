"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Youtube, Loader2 } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";

type FooterSettings = {
  phone?: string;
  email?: string;
  address?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  footerText?: string;
  hoursWeekday?: string;
  hoursSaturday?: string;
  hoursSunday?: string;
};

export default function Footer({ settings }: { settings?: FooterSettings }) {
  const phone = settings?.phone || "929-349-8569";
  const email = settings?.email || "info@mpmedpharma.com";
  const address = settings?.address || "New Jersey, NJ 07675, USA";
  const hoursWeekday = settings?.hoursWeekday || "8:00 AM – 6:00 PM";
  const hoursSaturday = settings?.hoursSaturday || "9:00 AM – 4:00 PM";
  const hoursSunday = settings?.hoursSunday || "Closed";
  const footerText = settings?.footerText || `© ${new Date().getFullYear()} MP MedPharma. All Rights Reserved.`;
  const linkedin = settings?.linkedin;
  const socialLinks = [
    { icon: Facebook, href: settings?.facebook },
    { icon: Twitter, href: settings?.twitter },
    { icon: Instagram, href: settings?.instagram },
    { icon: Youtube, href: settings?.youtube },
  ].filter((link): link is { icon: typeof Facebook; href: string } => Boolean(link.href));

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
              <LogoMark className="w-10 h-10 rounded-full flex-shrink-0" />
              <div>
                <div className="font-display text-lg font-semibold leading-tight text-white">MedPharma</div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-gold-400 leading-tight">Medical Equipment</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Providing premium medical equipment for healthcare professionals and home users since 2010. Quality, reliability, and innovation in every product.
            </p>
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MP MedPharma on LinkedIn"
                className="inline-flex items-center gap-2.5 rounded-lg bg-[#0A66C2] px-4 py-2.5 mb-4 transition-colors hover:bg-[#004182] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A66C2]"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 flex-shrink-0 fill-white">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                </svg>
                <span className="text-[15px] font-semibold leading-none text-white">LinkedIn</span>
              </a>
            )}
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map(({ icon: Icon, href }, i) => (
                  <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-800 hover:bg-primary-600 text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-colors">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Products", href: "/products" },
                { label: "Categories", href: "/categories" },
                { label: "Brands", href: "/brands" },
                { label: "Sell Your Product", href: "/sell-your-product" },
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
                <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                  {phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={15} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <a href={`mailto:${email}`} className="text-sm text-gray-400 hover:text-primary-400 transition-colors break-all">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">{address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={15} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-400 space-y-0.5">
                  <div>Mon – Fri: {hoursWeekday}</div>
                  <div>Saturday: {hoursSaturday}</div>
                  <div>Sunday: {hoursSunday}</div>
                </div>
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
            {footerText}
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
