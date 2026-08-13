"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronDown, ChevronLeft, ChevronRight, CheckCircle2, Loader2,
  UploadCloud, X, ImageOff, AlertCircle, ArrowRight,
} from "lucide-react";

const CATEGORIES = [
  "Diagnostic Equipment",
  "Imaging Equipment",
  "Patient Monitoring",
  "Surgical Equipment",
  "Laboratory Equipment",
  "Mobility & Rehabilitation",
  "Respiratory & Anesthesia",
  "Dental Equipment",
  "Sterilization Equipment",
  "Hospital Furniture",
  "Pharmaceutical Product",
  "Consumables & Accessories",
  "Other",
];

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Used", "For Parts", "Unknown"];
const CONTACT_METHODS = ["Email", "Phone", "Either"];

const PHOTO_SLOTS = [
  { key: "front", label: "Front View", hint: "Front view of the complete device" },
  { key: "back", label: "Back View", hint: "Back view of the complete device" },
  { key: "left", label: "Left Side", hint: "Left side view" },
  { key: "right", label: "Right Side", hint: "Right side view" },
  { key: "topBottom", label: "Top / Bottom View", hint: "Top or bottom view, where relevant" },
  { key: "idPlate", label: "Product Label / ID Plate", hint: "The product label or identification plate" },
  { key: "modelNumber", label: "Model Number", hint: "Close-up showing the model number" },
  { key: "modelYear", label: "Model Year", hint: "Close-up showing the model year, if available" },
  { key: "badge", label: "Manufacturer Badge", hint: "Manufacturer, brand, or medical device ID badge" },
  { key: "serial", label: "Serial Number", hint: "Clear photo of the device serial number" },
  { key: "damage", label: "Damage or Wear", hint: "Any damage, wear, cracks, stains, or missing parts" },
  { key: "accessories", label: "Accessories & Documentation", hint: "Cables, attachments, packaging, or documents" },
] as const;

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MIN_PHOTOS = 3;

interface SlotPhoto {
  id: string;
  slotKey: string;
  fileName: string;
  previewUrl: string;
  status: "uploading" | "done" | "error";
  progress: number;
  publicId?: string;
  error?: string;
}

const initialProduct = {
  productName: "",
  category: "",
  manufacturer: "",
  modelNumber: "",
  modelYear: "",
  serialNumber: "",
  quantity: "",
  condition: "",
  location: "",
  askingPrice: "",
  description: "",
};

const initialContact = {
  fullName: "",
  companyName: "",
  email: "",
  phone: "",
  preferredContact: "",
  country: "",
  city: "",
  comments: "",
};

const initialConsents = {
  consentAccurate: false,
  consentRight: false,
  consentNoPhi: false,
  consentContact: false,
  consentPrivacy: false,
};

const fieldLabel = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5";
const inputClass =
  "w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400";

function Select({
  value, onChange, options, placeholder, required,
}: { value: string; onChange: (v: string) => void; options: readonly string[]; placeholder: string; required?: boolean }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`${inputClass} appearance-none pr-9 cursor-pointer ${value ? "text-gray-900" : "text-gray-400"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="text-gray-900">{opt}</option>
        ))}
      </select>
      <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <span className="relative flex-shrink-0 mt-0.5 w-4 h-4">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="absolute inset-0 rounded border border-gray-300 bg-white peer-checked:bg-gold-500 peer-checked:border-gold-500 peer-focus-visible:ring-2 peer-focus-visible:ring-gold-400/50 transition-colors pointer-events-none" />
        <CheckCircle2 size={11} strokeWidth={3} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
      </span>
      <span className="text-xs text-gray-600 leading-relaxed">{children}</span>
    </label>
  );
}

const steps = ["Product Details", "Photos", "Contact & Review"];

export default function SellProductForm() {
  const [step, setStep] = useState(0);
  const [product, setProduct] = useState(initialProduct);
  const [contact, setContact] = useState(initialContact);
  const [consents, setConsents] = useState(initialConsents);
  const [photos, setPhotos] = useState<SlotPhoto[]>([]);
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ referenceNumber: string; estimatedReview: string; supportEmail: string } | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const setP = <K extends keyof typeof initialProduct>(k: K, v: string) => setProduct((s) => ({ ...s, [k]: v }));
  const setC = <K extends keyof typeof initialContact>(k: K, v: string) => setContact((s) => ({ ...s, [k]: v }));

  const doneCount = photos.filter((p) => p.status === "done").length;

  const uploadFile = (file: File, slotKey: string, label: string) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Each photo must be 10 MB or smaller.");
      return;
    }

    const id = `${slotKey}-${crypto.randomUUID()}`;
    const previewUrl = URL.createObjectURL(file);
    setPhotos((prev) => [...prev, { id, slotKey, fileName: file.name, previewUrl, status: "uploading", progress: 0 }]);

    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/product-submissions/upload");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        const progress = Math.round((e.loaded / e.total) * 100);
        setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, progress } : p)));
      };
      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && res.publicId) {
            setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, status: "done", progress: 100, publicId: res.publicId } : p)));
          } else {
            setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, status: "error", error: res.error || "Upload failed" } : p)));
          }
        } catch {
          setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, status: "error", error: "Upload failed" } : p)));
        }
      };
      xhr.onerror = () => {
        setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, status: "error", error: "Network error during upload" } : p)));
      };
      xhr.send(JSON.stringify({ data, label }));
    };
    reader.readAsDataURL(file);
  };

  const handleFiles = (slotKey: string, label: string, files: FileList | null) => {
    if (!files?.length) return;
    Array.from(files).forEach((f) => uploadFile(f, slotKey, label));
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const validateStep = (s: number) => {
    if (s === 0) {
      if (!product.productName.trim()) return "Please enter the product name.";
      if (!product.category) return "Please select a product category.";
      if (!product.manufacturer.trim()) return "Please enter the manufacturer or brand.";
      if (!product.condition) return "Please select the product condition.";
      return null;
    }
    if (s === 1) {
      if (doneCount < MIN_PHOTOS) return `Please upload at least ${MIN_PHOTOS} product photos before continuing.`;
      if (photos.some((p) => p.status === "uploading")) return "Please wait for all photos to finish uploading.";
      return null;
    }
    return null;
  };

  const goNext = () => {
    const err = validateStep(step);
    if (err) { toast.error(err); return; }
    setStep((s) => Math.min(s + 1, steps.length - 1));
    window.scrollTo({ top: document.getElementById("sell-form")?.offsetTop ?? 0, behavior: "smooth" });
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stepErr = validateStep(0) || validateStep(1);
    if (stepErr) { toast.error(stepErr); return; }
    if (!contact.fullName.trim()) return toast.error("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) return toast.error("Please enter a valid email address.");
    if (!contact.phone.trim()) return toast.error("Please enter a phone number.");
    if (Object.values(consents).some((v) => !v)) return toast.error("Please confirm all required checkboxes to continue.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/product-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          ...contact,
          ...consents,
          website,
          images: photos.filter((p) => p.status === "done").map((p) => ({ publicId: p.publicId, label: p.slotKey })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ referenceNumber: data.referenceNumber, estimatedReview: data.estimatedReview, supportEmail: data.supportEmail });
      } else {
        toast.error(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div id="sell-form" className="max-w-xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl shadow-primary-900/5 p-8 sm:p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gold-50 border border-gold-400/40 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-gold-600" />
        </div>
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Submission Received</h3>
        <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto mb-8">
          Thank you for submitting your product to MP MedPharma. Our team will review the information and images
          provided. If your submission meets our requirements, a member of our team will contact you using the
          details provided.
        </p>
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 text-left space-y-3 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Reference Number</span>
            <span className="font-semibold text-gray-900">{result.referenceNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Estimated Review Time</span>
            <span className="font-semibold text-gray-900">{result.estimatedReview}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Support Email</span>
            <a href={`mailto:${result.supportEmail}`} className="font-semibold text-primary-600 hover:underline">{result.supportEmail}</a>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed mb-8">
          Submitting a product does not guarantee acceptance, purchase, resale, or a quotation. All submissions are
          subject to review, verification, applicable regulations, product condition, market demand, and MP
          MedPharma approval.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm tracking-wide rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div id="sell-form" className="max-w-3xl mx-auto">
      {/* Step progress */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                  i < step ? "bg-gold-500 border-gold-500 text-white"
                  : i === step ? "border-gold-500 text-gold-600 bg-gold-50"
                  : "border-gray-200 text-gray-400 bg-white"
                }`}
              >
                {i < step ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span className={`hidden sm:block text-[11px] font-medium uppercase tracking-wide ${i === step ? "text-gray-900" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && <div className={`w-8 sm:w-16 h-px ${i < step ? "bg-gold-500" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-primary-900/5 p-6 sm:p-10">
        {/* honeypot */}
        <input
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          name="website"
        />

        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-1">Tell Us About Your Product</h3>
              <p className="text-sm text-gray-500">Complete and accurate information helps us evaluate your request more efficiently.</p>
            </div>

            <div>
              <label className={fieldLabel}>Product Name *</label>
              <input value={product.productName} onChange={(e) => setP("productName", e.target.value)} placeholder="e.g. Digital ECG Machine" className={inputClass} required />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={fieldLabel}>Product Category *</label>
                <Select value={product.category} onChange={(v) => setP("category", v)} options={CATEGORIES} placeholder="Select a category" required />
              </div>
              <div>
                <label className={fieldLabel}>Manufacturer / Brand *</label>
                <input value={product.manufacturer} onChange={(e) => setP("manufacturer", e.target.value)} placeholder="e.g. Philips, GE Healthcare" className={inputClass} required />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={fieldLabel}>Model Name / Number</label>
                <input value={product.modelNumber} onChange={(e) => setP("modelNumber", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={fieldLabel}>Model Year</label>
                <input value={product.modelYear} onChange={(e) => setP("modelYear", e.target.value)} placeholder="e.g. 2021" className={inputClass} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={fieldLabel}>Serial Number</label>
                <input value={product.serialNumber} onChange={(e) => setP("serialNumber", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={fieldLabel}>Quantity Available</label>
                <input value={product.quantity} onChange={(e) => setP("quantity", e.target.value)} placeholder="e.g. 1 unit" className={inputClass} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={fieldLabel}>Current Condition *</label>
                <Select value={product.condition} onChange={(v) => setP("condition", v)} options={CONDITIONS} placeholder="Select condition" required />
              </div>
              <div>
                <label className={fieldLabel}>Product Location</label>
                <input value={product.location} onChange={(e) => setP("location", e.target.value)} placeholder="City, Country" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={fieldLabel}>Expected Selling Price (optional)</label>
              <input value={product.askingPrice} onChange={(e) => setP("askingPrice", e.target.value)} placeholder="e.g. $2,500 or negotiable" className={inputClass} />
            </div>

            <div>
              <label className={fieldLabel}>Additional Comments or Details</label>
              <textarea rows={4} value={product.description} onChange={(e) => setP("description", e.target.value)} className={`${inputClass} resize-none`} placeholder="Tell us more about the product's history, usage, and condition..." />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-1">Upload Clear Product Photos</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Please upload clear, well-lit photos of the device itself. Take photographs from multiple angles so
                our team can properly assess its condition and identity.
              </p>
            </div>

            <div className="flex items-start gap-3 bg-primary-50 border border-primary-100 rounded-xl p-4">
              <AlertCircle size={18} className="text-primary-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-primary-900 leading-relaxed">
                Please do not upload photographs containing patients, patient records, personal health information,
                passwords, or other confidential information. Cover or remove sensitive information before uploading.
              </p>
            </div>

            <p className="text-xs text-gray-500">
              {doneCount} of {MIN_PHOTOS}+ required photos uploaded · JPG, PNG, or WEBP · max 10 MB each
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {PHOTO_SLOTS.map((slot) => {
                const slotPhotos = photos.filter((p) => p.slotKey === slot.key);
                return (
                  <div key={slot.key} className="border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-900">{slot.label}</p>
                    <p className="text-xs text-gray-400 mb-3">{slot.hint}</p>

                    {slotPhotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {slotPhotos.map((p) => (
                          <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not an optimizable remote asset */}
                            <img src={p.previewUrl} alt={p.fileName} className="w-full h-full object-cover" />
                            {p.status === "uploading" && (
                              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-[10px] gap-1">
                                <Loader2 size={16} className="animate-spin" />
                                {p.progress}%
                              </div>
                            )}
                            {p.status === "error" && (
                              <div className="absolute inset-0 bg-red-900/70 flex flex-col items-center justify-center text-white text-[9px] p-1 text-center gap-1">
                                <ImageOff size={14} />
                                {p.error}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removePhoto(p.id)}
                              aria-label="Remove photo"
                              className="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 shadow-sm"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleFiles(slot.key, slot.label, e.dataTransfer.files);
                      }}
                      onClick={() => fileInputs.current[slot.key]?.click()}
                      className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gold-400 hover:bg-gold-50/40 transition-colors text-xs text-gray-500"
                    >
                      <UploadCloud size={15} />
                      Drag & drop or click to upload
                      <input
                        ref={(el) => { fileInputs.current[slot.key] = el; }}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={(e) => { handleFiles(slot.key, slot.label, e.target.files); e.target.value = ""; }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-1">Your Contact Details</h3>
              <p className="text-sm text-gray-500">We&apos;ll use this information to follow up on your submission.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={fieldLabel}>Full Name *</label>
                <input value={contact.fullName} onChange={(e) => setC("fullName", e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className={fieldLabel}>Company / Organization</label>
                <input value={contact.companyName} onChange={(e) => setC("companyName", e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={fieldLabel}>Email Address *</label>
                <input type="email" value={contact.email} onChange={(e) => setC("email", e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className={fieldLabel}>Phone Number *</label>
                <input type="tel" value={contact.phone} onChange={(e) => setC("phone", e.target.value)} className={inputClass} required />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={fieldLabel}>Preferred Contact Method</label>
                <Select value={contact.preferredContact} onChange={(v) => setC("preferredContact", v)} options={CONTACT_METHODS} placeholder="Select a method" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={fieldLabel}>Country</label>
                  <input value={contact.country} onChange={(e) => setC("country", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={fieldLabel}>City</label>
                  <input value={contact.city} onChange={(e) => setC("city", e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            <div>
              <label className={fieldLabel}>Additional Comments</label>
              <textarea rows={3} value={contact.comments} onChange={(e) => setC("comments", e.target.value)} className={`${inputClass} resize-none`} />
            </div>

            <div className="border-t border-gray-100 pt-5 space-y-3">
              <Checkbox checked={consents.consentAccurate} onChange={(v) => setConsents((s) => ({ ...s, consentAccurate: v }))}>
                I confirm that the information provided is accurate to the best of my knowledge.
              </Checkbox>
              <Checkbox checked={consents.consentRight} onChange={(v) => setConsents((s) => ({ ...s, consentRight: v }))}>
                I confirm that I have the right to submit this product for sale, review, or quotation.
              </Checkbox>
              <Checkbox checked={consents.consentNoPhi} onChange={(v) => setConsents((s) => ({ ...s, consentNoPhi: v }))}>
                I confirm that the uploaded images do not contain patient information or confidential personal data.
              </Checkbox>
              <Checkbox checked={consents.consentContact} onChange={(v) => setConsents((s) => ({ ...s, consentContact: v }))}>
                I agree to MP MedPharma contacting me about this submission.
              </Checkbox>
              <Checkbox checked={consents.consentPrivacy} onChange={(v) => setConsents((s) => ({ ...s, consentPrivacy: v }))}>
                I have read and agree to the{" "}
                <Link href="/privacy" className="text-primary-600 hover:underline" target="_blank">Privacy Policy</Link>.
              </Checkbox>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-0 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {submitting ? "Submitting..." : "Submit Product for Review"}
            </button>
          )}
        </div>
      </form>

      <p className="text-[11px] text-gray-400 leading-relaxed text-center mt-6 max-w-xl mx-auto">
        Submitting a product does not guarantee acceptance, purchase, resale, or a quotation. All submissions are
        subject to review, verification, applicable regulations, product condition, market demand, and MP MedPharma
        approval.
      </p>
    </div>
  );
}
