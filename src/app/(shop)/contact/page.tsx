import { Metadata } from "next";
import ContactSection from "@/components/home/ContactSection";
import { getSiteSettings } from "@/lib/publicData";

// Settings come from a cached, tag-invalidated read, so the admin settings
// route still makes an edit appear immediately.
export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact MP MedPharma in New Jersey, USA for ophthalmic equipment pricing, private demos, and offers on the used equipment you are replacing. Phone, email and contact form.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-blue-100 text-lg">We&apos;d love to hear from you. Reach out anytime.</p>
        </div>
      </div>

      <ContactSection settings={settings} />
    </div>
  );
}
