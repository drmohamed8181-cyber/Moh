"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, Mail, MapPin, Send, CheckCircle } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const schema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

interface ContactSectionProps {
  hoursWeekday?: string;
  hoursSaturday?: string;
  hoursSunday?: string;
}

export default function ContactSection({
  hoursWeekday = "8:00 AM – 6:00 PM",
  hoursSaturday = "9:00 AM – 4:00 PM",
  hoursSunday = "Closed",
}: ContactSectionProps) {
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSuccess(true);
        reset();
        setTimeout(() => setSuccess(false), 6000);
      }
    } catch {
      // handled silently
    }
  };

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-2">Get In Touch</p>
          <h2 className="text-3xl font-bold text-slate-900">Contact Us</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Have questions about our products or need a custom quote? Our team is here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-5">
            {[
              { icon: Phone, title: "Call Us", value: "929-349-8569", href: "tel:929-349-8569" },
              { icon: Mail, title: "Email Us", value: "info@mpmedpharma.com", href: "mailto:info@mpmedpharma.com" },
              { icon: MapPin, title: "Location", value: "New Jersey, NJ, USA", href: "#" },
            ].map(({ icon: Icon, title, value, href }) => (
              <a
                key={title}
                href={href}
                className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                  <Icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-0.5">{title}</p>
                  <p className="text-slate-800 font-semibold text-sm">{value}</p>
                </div>
              </a>
            ))}

            {/* Hours */}
            <div className="p-5 bg-blue-600 rounded-2xl text-white">
              <h4 className="font-bold mb-3">Business Hours</h4>
              <div className="space-y-1.5 text-sm text-blue-100">
                <div className="flex justify-between">
                  <span>Mon – Fri</span><span>{hoursWeekday}</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span><span>{hoursSaturday}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span><span>{hoursSunday}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
            {success ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <CheckCircle className="w-14 h-14 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                <p className="text-slate-500 text-sm">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    placeholder="John Smith"
                    {...register("fullName")}
                    error={errors.fullName?.message}
                  />
                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="john@example.com"
                    {...register("email")}
                    error={errors.email?.message}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    {...register("phone")}
                  />
                  <Input
                    label="Subject *"
                    placeholder="Product inquiry"
                    {...register("subject")}
                    error={errors.subject?.message}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Message *</label>
                  <textarea
                    rows={5}
                    placeholder="Tell us about your needs…"
                    {...register("message")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                </div>
                <Button type="submit" loading={isSubmitting} size="lg" className="w-full">
                  <Send className="w-4 h-4 mr-2" /> Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
