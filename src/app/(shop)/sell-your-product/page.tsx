import { Metadata } from "next";
import { ClipboardList, Camera, UserCheck, ShieldCheck, ArrowDown } from "lucide-react";
import SellProductForm from "@/components/product/SellProductForm";

export const metadata: Metadata = {
  title: "Sell Your Product to MP MedPharma",
  description:
    "Submit your medical device, healthcare product, or pharmaceutical-related item to MP MedPharma for review, resale, trade-in, acquisition, or quotation.",
  alternates: { canonical: "/sell-your-product" },
};

const steps = [
  {
    icon: ClipboardList,
    title: "Tell Us About Your Product",
    description:
      "Share the product name, category, manufacturer, model, condition, location, and any other details that help our team understand what you're offering.",
  },
  {
    icon: Camera,
    title: "Upload Clear Product Photos",
    description:
      "Provide well-lit photos from multiple angles — front, back, sides, labels, serial number, and any wear — so our team can properly assess the item.",
  },
  {
    icon: UserCheck,
    title: "Submit Your Contact Details",
    description:
      "Give us a way to reach you. Confirm your information is accurate and that you agree to be contacted about your submission.",
  },
];

export default function SellYourProductPage() {
  return (
    <div>
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white py-24 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10 [background:radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_60%,white,transparent_30%)]" />
        <div className="container mx-auto px-4 text-center relative">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400 mb-5">MP MedPharma Trade-In &amp; Acquisition</p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Sell Your Product to <span className="text-gold-400">MP MedPharma</span>
          </h1>
          <p className="text-primary-100/90 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Have a medical device, healthcare product, or pharmaceutical-related item to sell? Submit your product
            details and photos to our team for review. Providing complete and accurate information helps us
            evaluate your request more efficiently.
          </p>
          <a
            href="#sell-form"
            className="inline-flex items-center gap-2 px-9 py-4 bg-gold-500 hover:bg-gold-600 text-white font-semibold text-sm tracking-wide rounded-lg shadow-lg shadow-black/20 hover:-translate-y-0.5 transition-all duration-300"
          >
            Submit Your Product <ArrowDown size={16} />
          </a>
        </div>
      </div>

      {/* Step-by-step guidance */}
      <div className="bg-gray-50 py-20 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600 mb-3">How It Works</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Three Simple Steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-8">
            {steps.map((s, i) => (
              <div key={s.title} className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-primary-900 flex items-center justify-center flex-shrink-0">
                    <s.icon size={19} className="text-gold-400" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-gold-600">Step {i + 1}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 max-w-3xl mx-auto bg-white border border-gray-100 rounded-2xl p-5">
            <ShieldCheck size={20} className="text-primary-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 leading-relaxed">
              Please do not upload photographs containing patients, patient records, personal health information,
              passwords, or other confidential information. Cover or remove sensitive information before uploading.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="py-20 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600 mb-3">Submission Form</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Submit Your Product for Review
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Complete all three steps below. Fields marked with an asterisk (*) are required.
            </p>
          </div>
          <SellProductForm />
        </div>
      </div>
    </div>
  );
}
