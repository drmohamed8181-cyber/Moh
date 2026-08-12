import { Metadata } from "next";
import AboutSection from "@/components/home/AboutSection";
import TrustBar from "@/components/home/TrustBar";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "About Us",
  description: "MP MedPharma – trusted supplier of ophthalmic, dental & surgical equipment, and official distributor of LIGHTMED SAPPHIRE dental lasers.",
};

export default function AboutPage() {
  return (
    <div>
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About MP MedPharma</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Trusted by hospitals and eye clinics worldwide since 2009
          </p>
        </div>
      </div>
      <TrustBar />
      <AboutSection />
    </div>
  );
}
