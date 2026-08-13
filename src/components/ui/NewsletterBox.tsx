"use client";

import { useId, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";

type FormState = {
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  organization: string;
  address: string;
};

type FieldErrors = Partial<Record<"name" | "email", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_FORM: FormState = { name: "", email: "", phone: "", jobTitle: "", organization: "", address: "" };

const FIELD_CLASSES =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none ring-1 ring-transparent transition-colors focus-visible:ring-2 focus-visible:ring-gold-400/50";

export default function NewsletterBox() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const idPrefix = useId();
  const errorId = `${idPrefix}-error`;
  const statusId = `${idPrefix}-status`;

  const setField = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (key === "name" || key === "email") {
      setErrors((err) => (err[key] ? { ...err, [key]: undefined } : err));
    }
    if (status === "error") setStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!form.name.trim()) nextErrors.name = "Please enter your name.";
    if (!EMAIL_RE.test(form.email.trim())) nextErrors.email = "Please enter a valid email address.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          jobTitle: form.jobTitle.trim(),
          organization: form.organization.trim(),
          address: form.address.trim(),
        }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-[#0A1220] to-black shadow-[0_25px_70px_-25px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
      {/* Top hairline accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/70 to-transparent" aria-hidden="true" />

      {/* Ambient glow accents */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary-500/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl" aria-hidden="true" />

      {/* Abstract molecular-network pattern */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12] [mask-image:radial-gradient(ellipse_at_center,transparent_25%,black_75%)]"
        viewBox="0 0 800 400"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g stroke="#C6A664" strokeWidth="1">
          <line x1="60" y1="60" x2="220" y2="140" />
          <line x1="220" y1="140" x2="180" y2="300" />
          <line x1="220" y1="140" x2="420" y2="90" />
          <line x1="420" y1="90" x2="560" y2="200" />
          <line x1="560" y1="200" x2="740" y2="120" />
          <line x1="560" y1="200" x2="640" y2="340" />
          <line x1="180" y1="300" x2="380" y2="360" />
        </g>
        <g fill="#C6A664">
          <circle cx="60" cy="60" r="4" />
          <circle cx="220" cy="140" r="5" />
          <circle cx="180" cy="300" r="4" />
          <circle cx="420" cy="90" r="4" />
          <circle cx="560" cy="200" r="5" />
          <circle cx="740" cy="120" r="4" />
          <circle cx="640" cy="340" r="4" />
          <circle cx="380" cy="360" r="4" />
        </g>
      </svg>

      <div className="relative px-6 py-14 sm:px-10 sm:py-16 lg:px-16">
        {/* Copy */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold-400/70" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Newsletter</span>
            <span className="h-px w-8 bg-gold-400/70" aria-hidden="true" />
          </div>

          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            Stay Ahead of Medical Innovation
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
            Be the first to discover the latest medical devices, technology updates, and new
            product listings delivered straight to your inbox.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/45">
            <ShieldCheck size={14} className="shrink-0 text-gold-400/80" />
            <span>Join healthcare professionals and industry leaders staying informed.</span>
          </div>
        </div>

        {/* Form / success state */}
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm sm:p-8">
          {status === "success" ? (
            <div className="animate-fade-in flex flex-col items-center py-4 text-center" role="status" aria-live="polite">
              <CheckCircle2 className="h-11 w-11 text-gold-400" />
              <p className="mt-4 text-base font-semibold text-white">
                Thank you for subscribing{form.name.trim() ? `, ${form.name.trim().split(" ")[0]}` : ""}!
              </p>
              <p className="mt-1.5 text-sm text-white/60">
                You&apos;ll be among the first to hear about new medical device listings.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor={`${idPrefix}-name`} className="mb-1.5 block text-sm font-medium text-white/80">
                    Full Name <span className="text-gold-400">*</span>
                  </label>
                  <input
                    id={`${idPrefix}-name`}
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={setField("name")}
                    placeholder="Full name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? errorId : undefined}
                    className={cn(FIELD_CLASSES, errors.name && "ring-red-400/60")}
                  />
                </div>
                <div>
                  <label htmlFor={`${idPrefix}-email`} className="mb-1.5 block text-sm font-medium text-white/80">
                    Email Address <span className="text-gold-400">*</span>
                  </label>
                  <input
                    id={`${idPrefix}-email`}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={setField("email")}
                    placeholder="Email address"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? errorId : undefined}
                    className={cn(FIELD_CLASSES, errors.email && "ring-red-400/60")}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor={`${idPrefix}-phone`} className="mb-1.5 block text-sm font-medium text-white/80">
                    Phone Number
                  </label>
                  <input
                    id={`${idPrefix}-phone`}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={setField("phone")}
                    placeholder="Phone number"
                    className={FIELD_CLASSES}
                  />
                </div>
                <div>
                  <label htmlFor={`${idPrefix}-job`} className="mb-1.5 block text-sm font-medium text-white/80">
                    Job Title
                  </label>
                  <input
                    id={`${idPrefix}-job`}
                    type="text"
                    autoComplete="organization-title"
                    value={form.jobTitle}
                    onChange={setField("jobTitle")}
                    placeholder="Job title"
                    className={FIELD_CLASSES}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor={`${idPrefix}-org`} className="mb-1.5 block text-sm font-medium text-white/80">
                    Organization / Workplace
                  </label>
                  <input
                    id={`${idPrefix}-org`}
                    type="text"
                    autoComplete="organization"
                    value={form.organization}
                    onChange={setField("organization")}
                    placeholder="Organization or workplace"
                    className={FIELD_CLASSES}
                  />
                </div>
                <div>
                  <label htmlFor={`${idPrefix}-address`} className="mb-1.5 block text-sm font-medium text-white/80">
                    Address
                  </label>
                  <input
                    id={`${idPrefix}-address`}
                    type="text"
                    autoComplete="street-address"
                    value={form.address}
                    onChange={setField("address")}
                    placeholder="Street address"
                    className={FIELD_CLASSES}
                  />
                </div>
              </div>

              <div className="min-h-[1.25rem]" id={statusId} aria-live="polite">
                {(errors.name || errors.email) && (
                  <p id={errorId} className="text-xs text-red-300">
                    {errors.name || errors.email}
                  </p>
                )}
                {status === "error" && !errors.name && !errors.email && (
                  <p id={errorId} className="text-xs text-red-300">
                    Something went wrong. Please try again.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="group inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-gold-400 px-6 py-3 text-sm font-semibold text-primary-900 shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-gold-500 hover:shadow-xl hover:shadow-gold-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none"
              >
                {status === "loading" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                )}
                Join the Newsletter
              </button>

              <p className="text-center text-xs text-white/45">No spam. Unsubscribe anytime.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
