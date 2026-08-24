import { Metadata } from "next";
import Link from "next/link";
import { jsonLdScript } from "@/lib/jsonLd";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about MP MedPharma's medical equipment, pricing, and ordering process.",
  alternates: { canonical: "/faq" },
};

const faqs = [
  {
    q: "How do I get pricing for a product?",
    a: "Most of our equipment is priced on request due to configuration, shipping, and installation variables. Click \"Inquire\" on any product page, or use our Contact form, and a specialist will send you a formal quote.",
  },
  {
    q: "Do you sell to individuals or only to clinics and hospitals?",
    a: "We primarily serve hospitals, surgical centers, clinics, and dental practices. Individual healthcare professionals and distributors are welcome to reach out as well — contact us to discuss your needs.",
  },
  {
    q: "Is the equipment new or refurbished?",
    a: "We offer both new and certified pre-owned equipment depending on the product. Availability and condition are noted in each inquiry response, and every unit goes through our quality inspection before it ships.",
  },
  {
    q: "Can I request a demo before purchasing?",
    a: "Yes. Many products include a \"Request a Private Demo\" option on their product page. You can also request a demonstration directly through our Contact form.",
  },
  {
    q: "Do you provide installation and training?",
    a: "Yes, white-glove delivery, installation, and clinical training are available for applicable equipment. Ask your MP MedPharma representative when requesting your quote.",
  },
  {
    q: "What is your warranty coverage?",
    a: "Warranty terms vary by manufacturer and product. Factory warranty details are provided with every quote, and extended service plans are available on most equipment.",
  },
  {
    q: "How long does shipping take?",
    a: "Lead times depend on the equipment and your location. Standard items typically ship within 1-2 weeks; capital equipment with installation may take longer. See our Shipping Policy for details.",
  },
  {
    q: "How do I check the status of an order?",
    a: "Signed-in customers can view order status under My Account → My Orders. For any other questions, contact our support team with your order number.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function FaqPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faqJsonLd) }}
      />
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Answers to common questions about our products and ordering process
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="space-y-3">
          {faqs.map(({ q, a }) => (
            <details key={q} className="group bg-white border border-gray-100 rounded-2xl p-5 open:shadow-sm transition-shadow">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-900 text-sm list-none">
                {q}
                <span className="text-primary-600 text-xl leading-none ml-4 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-sm text-gray-600 leading-relaxed mt-3">{a}</p>
            </details>
          ))}
        </div>

        <div className="text-center mt-12 p-8 bg-gray-50 rounded-2xl">
          <p className="text-gray-700 font-medium mb-1">Still have questions?</p>
          <p className="text-sm text-gray-500 mb-4">Our team is happy to help with anything not covered here.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
