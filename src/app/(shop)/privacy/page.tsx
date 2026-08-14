import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How MP MedPharma collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div>
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">Last updated: August 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl space-y-10">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Information We Collect</h2>
          <p className="text-gray-600 leading-relaxed">
            When you create an account, submit a product inquiry, request a demo, or contact us, we collect the
            information you provide directly — such as your name, email address, phone number, organization, and
            the content of your message. If you create an account, we also store your order and wishlist history
            so you can track it under My Account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">How We Use Your Information</h2>
          <p className="text-gray-600 leading-relaxed">
            We use the information you provide to respond to inquiries, prepare quotes, process orders, schedule
            demonstrations, provide customer support, and — where you&apos;ve opted in — send occasional product
            updates or newsletters. We do not sell your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Cookies</h2>
          <p className="text-gray-600 leading-relaxed">
            We use essential cookies to keep you signed in and remember your preferences. We do not use cookies
            for third-party advertising.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Data Security</h2>
          <p className="text-gray-600 leading-relaxed">
            We take reasonable technical and organizational measures to protect your information, including
            encrypted password storage. No method of transmission or storage is 100% secure, and we cannot
            guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Your Choices</h2>
          <p className="text-gray-600 leading-relaxed">
            You can review or update your account information at any time under My Account → Settings, and you
            can unsubscribe from our newsletter using the link in any email we send. To request deletion of your
            account or data, contact us using the details below.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Us</h2>
          <p className="text-gray-600 leading-relaxed">
            Questions about this policy can be sent to{" "}
            <a href="mailto:info@mpmedpharma.com" className="text-primary-600 hover:underline">info@mpmedpharma.com</a>{" "}
            or <a href="tel:9293498569" className="text-primary-600 hover:underline">929-349-8569</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
