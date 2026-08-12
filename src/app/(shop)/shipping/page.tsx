import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "MP MedPharma's shipping, delivery, and installation policy for medical equipment orders.",
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
            Smaller diagnostic and handheld devices ship via standard courier. Larger surgical and imaging systems
            are shipped via specialized medical equipment freight carriers, with white-glove delivery, uncrating,
            and placement available on request. Shipping costs are calculated based on equipment size, weight,
            destination, and delivery service level, and are included in your formal quote.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Installation &amp; Training</h2>
          <p className="text-gray-600 leading-relaxed">
            For applicable capital equipment, we coordinate on-site installation, calibration, and clinical
            training with your facility. This is scheduled directly with your representative after delivery.
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
            <a href="mailto:dr.mohamed8181@gmail.com" className="text-primary-600 hover:underline">dr.mohamed8181@gmail.com</a>{" "}
            or <a href="tel:9293498569" className="text-primary-600 hover:underline">929-349-8569</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
