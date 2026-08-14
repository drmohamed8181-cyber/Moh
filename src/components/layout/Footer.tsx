"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Linkedin, Youtube, Loader2 } from "lucide-react";

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
  const address = settings?.address || "New York, NY 10001, USA";
  const hoursWeekday = settings?.hoursWeekday || "8:00 AM – 6:00 PM";
  const hoursSaturday = settings?.hoursSaturday || "9:00 AM – 4:00 PM";
  const hoursSunday = settings?.hoursSunday || "Closed";
  const footerText = settings?.footerText || `© ${new Date().getFullYear()} MP MedPharma. All Rights Reserved.`;
  const socialLinks = [
    { icon: Facebook, href: settings?.facebook },
    { icon: Twitter, href: settings?.twitter },
    { icon: Instagram, href: settings?.instagram },
    { icon: Linkedin, href: settings?.linkedin },
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
