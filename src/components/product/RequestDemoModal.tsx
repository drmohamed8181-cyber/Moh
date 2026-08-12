"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { X, ChevronDown, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

const ROLES = [
  "Physician",
  "Specialist",
  "Practice Owner",
  "Practice Administrator",
  "Hospital / Group",
  "Distributor",
  "Other",
];

const DEMO_FORMATS = ["In-Person Demonstration", "Virtual Demonstration", "Either"];

const CONTACT_METHODS = ["Email", "Phone", "Either"];

const INTERESTS = [
  "Product demonstration",
  "Clinical applications",
  "Technology overview",
  "Practice integration",
  "Pricing & availability",
  "Purchasing information",
  "Other",
];

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  organization: "",
  cityState: "",
  role: "",
  demoFormat: "",
  contactMethod: "",
  interest: "",
  message: "",
  consent: false,
};

type FormState = typeof initialForm;

interface Product {
  name: string;
  slug: string;
  images: string[];
  category?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  product: Product;
}

const fieldLabel = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5";
const inputClass =
  "w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400";

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} appearance-none pr-9 cursor-pointer ${value ? "text-gray-900" : "text-gray-400"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="text-gray-900">
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

export default function RequestDemoModal({ open, onClose, product }: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const hasOpenedRef = useRef(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (open) {
      hasOpenedRef.current = true;
      setForm(initialForm);
      setSuccess(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error("Please share your name and professional email.");
      return;
    }
    if (!form.consent) {
      toast.error("Please confirm consent to be contacted to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/demo-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productName: product.name, productSlug: product.slug }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open && !hasOpenedRef.current) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 grid lg:grid-cols-2 transition-all duration-300 ease-out ${
          open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Left — product presentation */}
        <div className="bg-gray-50 p-8 sm:p-10 flex flex-col justify-center gap-6 lg:rounded-l-2xl">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-600 mb-3">
              Private Demonstration
            </p>
            <h3 className="font-display text-2xl font-bold text-gray-900 tracking-tight">{product.name}</h3>
            {product.category && <p className="text-sm text-gray-500 mt-1">{product.category}</p>}
          </div>

          {product.images[0] && (
            <div className="relative aspect-square w-full max-w-xs mx-auto bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <Image src={product.images[0]} alt={product.name} fill className="object-contain p-8" sizes="320px" />
            </div>
          )}

          <p className="text-sm text-gray-600 leading-relaxed">
            Request a personalized demonstration and explore the technology with an MP MedPharma representative.
          </p>
        </div>

        {/* Right — form / success */}
        <div className="p-8 sm:p-10">
          {success ? (
            <div className="flex flex-col items-center justify-center text-center min-h-[420px] py-6">
              <div className="w-14 h-14 rounded-full bg-gold-50 border border-gold-400/40 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-7 h-7 text-gold-600" />
              </div>
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">Your Demo Request Has Been Received</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-sm mb-8">
                Thank you for your interest in the {product.name}. An MP MedPharma representative will contact you to coordinate your personalized demonstration.
              </p>
              <div className="pt-5 border-t border-gray-100 w-full max-w-xs">
                <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gold-600 mt-1">MP MedPharma</p>
              </div>
              <button
                onClick={onClose}
                className="mt-8 text-sm text-gray-500 hover:text-gray-800 font-medium border-b border-gray-300 hover:border-gray-500 pb-0.5 transition-colors"
              >
                Return to Product
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
                Experience the {product.name}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Request a personalized demonstration and discover how the {product.name} can support your practice.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={fieldLabel}>Full Name</label>
                  <input type="text" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Dr. First & Last Name" className={inputClass} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={fieldLabel}>Professional Email</label>
                    <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="your.name@practice.com" className={inputClass} />
                  </div>
                  <div>
                    <label className={fieldLabel}>Phone Number</label>
                    <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(555) 555-5555" className={inputClass} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={fieldLabel}>Practice / Organization</label>
                    <input type="text" value={form.organization} onChange={(e) => set("organization", e.target.value)} placeholder="Practice or organization name" className={inputClass} />
                  </div>
                  <div>
                    <label className={fieldLabel}>City / State</label>
                    <input type="text" value={form.cityState} onChange={(e) => set("cityState", e.target.value)} placeholder="City, State" className={inputClass} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={fieldLabel}>Professional Role</label>
                    <Select value={form.role} onChange={(v) => set("role", v)} options={ROLES} placeholder="Select your role" />
                  </div>
                  <div>
                    <label className={fieldLabel}>Preferred Demo Format</label>
                    <Select value={form.demoFormat} onChange={(v) => set("demoFormat", v)} options={DEMO_FORMATS} placeholder="Select a format" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={fieldLabel}>Preferred Contact Method</label>
                    <Select value={form.contactMethod} onChange={(v) => set("contactMethod", v)} options={CONTACT_METHODS} placeholder="Select a method" />
                  </div>
                  <div>
                    <label className={fieldLabel}>Most Interested In</label>
                    <Select value={form.interest} onChange={(v) => set("interest", v)} options={INTERESTS} placeholder="Select an option" />
                  </div>
                </div>

                <div>
                  <label className={fieldLabel}>Message / Questions</label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    placeholder={`Tell us what you'd like to learn about the ${product.name}.`}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <label className="flex items-start gap-3 pt-1 cursor-pointer">
                  <span className="relative flex-shrink-0 mt-0.5 w-4 h-4">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={(e) => set("consent", e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="absolute inset-0 rounded border border-gray-300 bg-white peer-checked:bg-gold-500 peer-checked:border-gold-500 peer-focus-visible:ring-2 peer-focus-visible:ring-gold-400/50 transition-colors pointer-events-none" />
                    <CheckCircle2 size={11} strokeWidth={3} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                  </span>
                  <span className="text-xs text-gray-600 leading-relaxed">
                    I agree to be contacted by MP MedPharma regarding my demo request and related product information.
                  </span>
                </label>

                <p className="text-[11px] text-gray-400 leading-relaxed pl-7">
                  Your information is kept confidential and will be used to respond to your request and provide relevant information about MP MedPharma products and services.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm tracking-wide rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={15} />}
                  {loading ? "Submitting..." : "Request My Demo"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
