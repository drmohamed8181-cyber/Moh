import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Award, Users, Truck } from "lucide-react";

const stats = [
  { icon: Award, label: "Years of Excellence", value: "15+" },
  { icon: Users, label: "Industry Experience", value: "10+" },
  { icon: CheckCircle, label: "Hospitals & Clinics Served", value: "500+" },
  { icon: Truck, label: "Certified Products", value: "200+" },
];

interface Props {
  content?: { heading?: string; text?: string; image?: string } | null;
}

export default function AboutSection({ content }: Props) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
              <Image
                src={content?.image ?? "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80"}
                alt="About MP MedPharma"
                fill
                className="object-cover"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 bg-primary-600 text-white rounded-2xl p-5 shadow-xl">
              <div className="text-3xl font-bold">15+</div>
              <div className="text-sm text-primary-200">Years of Excellence</div>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-3">About Us</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {content?.heading ?? "Your Trusted Partner in Ophthalmic, Dental & Surgical Equipment"}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              {content?.text ?? "MP MedPharma is a trusted supplier of ophthalmic, dental, and surgical medical devices, built on nearly two decades of industry experience. We work directly with leading global manufacturers to bring healthcare providers new and certified refurbished equipment — never a compromise on quality, always backed by documented service history and warranty coverage."}
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              As the official distributor of LIGHTMED SAPPHIRE dental lasers, we give clinics and hospitals direct access to advanced, authorized technology. Our equipment acquisition program also offers healthcare facilities fair, transparent valuations for pre-owned devices — making it simple to upgrade, sell, or invest with confidence.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                "New & refurbished ophthalmic, dental & surgical equipment",
                "Official distributor of LIGHTMED SAPPHIRE dental lasers",
                "Documented service records & warranty on every product",
                "We buy your used ophthalmic & surgical equipment — fair, transparent offers",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle size={18} className="text-primary-600 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg"
            >
              Learn More About Us
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center p-6 bg-primary-50 rounded-2xl border border-primary-100">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon size={22} />
              </div>
              <div className="text-3xl font-bold text-primary-700 mb-1">{value}</div>
              <div className="text-sm text-gray-600">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
