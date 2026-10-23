import { Metadata } from "next";
import { websiteMailto } from "@/lib/mailto";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "MP MedPharma's shipping, delivery, and installation policy for medical equipment orders.",
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <div>
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Shipping Policy</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">How we get your equipment to you, safely and on time</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl prose prose-sm prose-slate">
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Order Processing</h2>
          <p className="text-gray-600 leading-relaxed">
            Once your order is confirmed, most in-stock equipment ships within 1-2 business days. Capital equipment
            and items requiring configuration or pre-installation testing typically ship within 1-3 weeks. Your
            MP MedPharma representative will confirm an estimated timeline when your order is placed.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Freight &amp; White-Glove Delivery</h2>
          <p className="text-gray-600 leading-relaxed">
            Equipment ships within the United States at a flat freight rate per item. Larger surgical and imaging
            systems travel by specialized medical equipment freight with white-glove delivery, uncrating, and
            placement; smaller diagnostic and handheld devices ship by standard courier. For capital equipment, the
            flat rate also covers on-site installation, staff training, and in-service at your facility.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Installation &amp; Training</h2>
          <p className="text-gray-600 leading-relaxed">
            For capital equipment, on-site installation, calibration, and clinical training are included in the
            freight rate and scheduled directly with your representative after delivery.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">International Shipping</h2>
          <p className="text-gray-600 leading-relaxed">
            We ship internationally for select equipment. Import duties, taxes, and any required regulatory
            documentation are the responsibility of the receiving party unless otherwise agreed in writing.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Questions About Your Shipment</h2>
          <p className="text-gray-600 leading-relaxed">
            For shipping updates on an existing order, visit My Account → My Orders, or contact us at{" "}
            <a href={websiteMailto("info@mpmedpharma.com")} className="text-primary-600 hover:underline">info@mpmedpharma.com</a>{" "}
            or <a href="tel:9175824568" className="text-primary-600 hover:underline">917-582-4568</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
