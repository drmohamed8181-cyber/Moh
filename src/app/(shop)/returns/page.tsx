import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return Policy",
  description: "MP MedPharma's return, cancellation, and warranty claim policy for medical equipment orders.",
};

export default function ReturnsPage() {
  return (
    <div>
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Return Policy</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">Our approach to returns, cancellations, and warranty claims</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Equipment Returns</h2>
          <p className="text-gray-600 leading-relaxed">
            Because much of our equipment is quoted and configured to a specific order, returns are evaluated on a
            case-by-case basis. Unopened, uninstalled equipment in its original packaging may generally be returned
            within 14 days of delivery, subject to a restocking fee to cover freight and handling. Custom-configured,
            special-order, or installed equipment is not eligible for return unless it arrives defective.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Damaged or Defective Equipment</h2>
          <p className="text-gray-600 leading-relaxed">
            If your equipment arrives damaged or is not functioning as expected, contact us within 48 hours of
            delivery with your order number and photos or a description of the issue. We will arrange an
            inspection, repair, replacement, or refund as appropriate.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Warranty Claims</h2>
          <p className="text-gray-600 leading-relaxed">
            Manufacturer warranty terms apply to all covered equipment. To file a warranty claim, contact your
            MP MedPharma representative with your order number and a description of the issue, and we will
            coordinate service directly with the manufacturer or our authorized service network.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Order Cancellations</h2>
          <p className="text-gray-600 leading-relaxed">
            Orders may be cancelled free of charge before they ship. Once an order has shipped or entered
            production/configuration, cancellation may be subject to a cancellation fee to cover costs already
            incurred.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Start a Return or Claim</h2>
          <p className="text-gray-600 leading-relaxed">
            Reach out to our team at{" "}
            <a href="mailto:dr.mohamed8181@gmail.com" className="text-primary-600 hover:underline">dr.mohamed8181@gmail.com</a>{" "}
            or <a href="tel:9293498569" className="text-primary-600 hover:underline">929-349-8569</a> with your order
            number, and we&apos;ll walk you through the next steps.
          </p>
        </section>
      </div>
    </div>
  );
}
