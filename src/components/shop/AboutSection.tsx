import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Award, Users, Shield } from "lucide-react";

interface AboutSectionProps {
  title?: string;
  description?: string;
  image?: string;
}

const stats = [
  { icon: Award, label: "Years of Experience", value: "15+" },
  { icon: Users, label: "Healthcare Partners", value: "2,000+" },
  { icon: Shield, label: "Certified Products", value: "500+" },
];

const points = [
  "ISO 13485 certified medical device quality management",
  "Direct partnerships with leading global manufacturers",
  "Expert clinical support team available 24/7",
  "Nationwide delivery with same-day dispatch",
];

export default function AboutSection({
  title = "Your Trusted Medical Equipment Partner",
  description = "MP MedPharma has been serving healthcare professionals, hospitals, and clinics since 2009. We supply a comprehensive range of premium medical equipment — from patient monitoring systems to surgical instruments — backed by rigorous quality standards and expert support.",
  image = "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=700&q=80",
}: AboutSectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
              <Image
                src={image}
                alt="About MP MedPharma"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-5 -right-5 bg-blue-600 text-white rounded-2xl p-4 shadow-xl hidden sm:block">
              <p className="text-2xl font-bold">15+</p>
              <p className="text-xs text-blue-200">Years of Excellence</p>
            </div>
            {/* Stats row */}
            <div className="absolute -top-5 left-4 right-4 grid grid-cols-3 gap-2 hidden sm:grid">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white rounded-xl p-3 shadow-lg text-center border border-slate-100">
                  <Icon className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="font-bold text-slate-900 text-sm">{value}</p>
                  <p className="text-slate-400 text-xs leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-3">About Us</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-5">{title}</h2>
            <p className="text-slate-500 leading-relaxed mb-8">{description}</p>

            <ul className="space-y-3 mb-8">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600 text-sm">{point}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
