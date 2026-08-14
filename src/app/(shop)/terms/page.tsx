import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms and conditions governing use of the MP MedPharma website and purchase of equipment.",
};

export default function TermsPage() {
  return (
    <div>
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms &amp; Conditions</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">Last updated: August 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl space-y-10">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing or using the MP MedPharma website, you agree to these Terms &amp; Conditions. If you do
            not agree, please do not use this site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Product Information &amp; Pricing</h2>
          <p className="text-gray-600 leading-relaxed">
            Product descriptions, images, and specifications are provided for general reference and are subject
            to change without notice. Most equipment is priced on request; pricing shown or quoted is not final
            until confirmed in writing by an MP MedPharma representative.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Orders &amp; Quotes</h2>
          <p className="text-gray-600 leading-relaxed">
            Submitting an inquiry or demo request does not constitute a binding order. Orders are confirmed only
            after a formal quote has been issued and accepted in writing by both parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Intended Use</h2>
          <p className="text-gray-600 leading-relaxed">
            Equipment offered through this site is intended for use by qualified healthcare professionals and
            licensed facilities in accordance with applicable laws and regulations. It is the purchaser&apos;s
            responsibility to ensure equipment is used in compliance with local regulatory requirements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Intellectual Property</h2>
          <p className="text-gray-600 leading-relaxed">
            All content on this site, including text, images, and branding, is the property of MP MedPharma or
            its licensors and may not be reproduced without permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">
            MP MedPharma is not liable for indirect, incidental, or consequential damages arising from use of
            this website or the equipment sold through it, beyond what is required by applicable law and the
            manufacturer&apos;s warranty terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Governing Law</h2>
          <p className="text-gray-600 leading-relaxed">
            These terms are governed by the laws of the State of New York, without regard to conflict of law
            principles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Us</h2>
          <p className="text-gray-600 leading-relaxed">
            Questions about these terms can be sent to{" "}
            <a href="mailto:info@mpmedpharma.com" className="text-primary-600 hover:underline">info@mpmedpharma.com</a>{" "}
            or <a href="tel:9293498569" className="text-primary-600 hover:underline">929-349-8569</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
