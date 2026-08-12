"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";

function InquiryPrefill({ onPrefill }: { onPrefill: (subject: string, message: string) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const subject = searchParams.get("subject");
    const message = searchParams.get("message");
    if (subject || message) onPrefill(subject ?? "", message ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handlePrefill = useCallback((subject: string, message: string) => {
    setForm((f) => ({
      ...f,
      subject: subject || f.subject,
      message: message || f.message,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Message sent! We'll get back to you shortly.");
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-medical-gray">
      <Suspense fallback={null}>
        <InquiryPrefill onPrefill={handlePrefill} />
      </Suspense>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-2">Get in Touch</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Contact Us</h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">Have questions about our products or need technical support? Our team is ready to help.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Info */}
          <div className="space-y-6">
            {[
              { icon: Phone, title: "Phone", content: "929-349-8569", href: "tel:9293498569" },
              { icon: Mail, title: "Email", content: "dr.mohamed8181@gmail.com", href: "mailto:dr.mohamed8181@gmail.com" },
              { icon: MapPin, title: "Address", content: "New York, NY 10001, USA", href: "#" },
              { icon: Clock, title: "Hours", content: "Mon–Fri: 9AM – 6PM\nSat: 10AM – 4PM", href: null },
            ].map(({ icon: Icon, title, content, href }) => (
              <div key={title} className="flex gap-4 p-5 bg-white rounded-2xl shadow-card">
                <div className="w-11 h-11 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{title}</p>
                  {href ? (
                    <a href={href} className="text-sm text-gray-800 hover:text-primary-600 transition-colors whitespace-pre-line">{content}</a>
                  ) : (
                    <p className="text-sm text-gray-800 whitespace-pre-line">{content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="Product inquiry..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message <span className="text-red-500">*</span></label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
