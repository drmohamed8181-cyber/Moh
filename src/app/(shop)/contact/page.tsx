import { Metadata } from "next";
import ContactSection from "@/components/home/ContactSection";
import { safeDb } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with MP MedPharma.",
};

export default async function ContactPage() {
  const rows = (await safeDb((db) => db.siteSetting.findMany())) ?? [];
  const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));

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
