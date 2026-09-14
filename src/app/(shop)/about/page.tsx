import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Award, Shield, Headphones, Wrench, CheckCircle, ArrowRight, MapPin } from "lucide-react";
import TrustBar from "@/components/home/TrustBar";
import { jsonLdScript } from "@/lib/jsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

// Nothing on this page reads the database, so it is fully static.
//
// Every claim here is one the rest of the site already makes. The page used to
// carry "15+ Years of Excellence", "10+ Industry Experience", "500+ Hospitals &
// Clinics Served" and "200+ Certified Products" — all template placeholders,
// none of them measured, and the first two contradicted each other. It also
// claimed the business works "directly with leading global manufacturers",
// which is not what a reseller of refurbished equipment does. They are gone
// rather than re-estimated: an unverifiable number on an About page is worth
// less than the sentence it displaces.
export const metadata: Metadata = {
  title: "About Us",
  description:
    "MP MedPharma is a New Jersey, USA based supplier of new and certified refurbished ophthalmic, surgical and dental equipment, serving hospitals and eye clinics since 2009 with warranty on every unit.",
  alternates: { canonical: "/about" },
};

const stats = [
  { icon: Award, value: "Since 2009", label: "Supplying eye care" },
  { icon: Shield, value: "Warranty", label: "On every unit we sell" },
  { icon: Wrench, value: "Documented", label: "Service history, per unit" },
  { icon: Headphones, value: "Installed", label: "Delivery, setup and training" },
];

const whatWeSupply = [
  {
    heading: "Cataract & refractive surgery",
    body: "Phacoemulsification and vitreoretinal platforms, excimer and femtosecond lasers, microkeratomes and topographers.",
    href: "/products?specialty=ophthalmology",
  },
  {
    heading: "Lasers & diagnostics",
    body: "SLT and YAG lasers, retina and glaucoma photocoagulation, OCT and diagnostic imaging, slit lamps and surgical microscopes.",
    href: "/categories",
  },
  {
    heading: "Dental operatory",
    body: "Integrated dental chair units — patient chair, delivery system, operating light and assistant side — for general, paediatric and multi-chair practice.",
    href: "/categories/dental-chairs",
  },
];

const howWeWork = [
  {
    heading: "Every unit is inspected and documented",
    body: "A refurbished device is only worth buying if someone can tell you what was done to it. Units ship with their service history, and we will tell you what was replaced and what was left alone.",
  },
  {
    heading: "Warranty on new and refurbished alike",
    body: "Warranty coverage applies to every unit we supply, not only the new ones. Refurbished equipment that cannot be stood behind is simply used equipment.",
  },
  {
    heading: "Delivered, installed and handed over",
    body: "Capital equipment does not finish at the loading dock. We arrange white-glove delivery, installation and clinical training so the room is working before we leave it.",
  },
  {
    heading: "Quoted per unit, not from a list",
    body: "Condition, configuration and included accessories differ on every device, so pricing is quoted against the actual unit and the room it is going into.",
  },
];

export default function AboutPage() {
  const organisationJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${SITE_NAME}`,
    url: `${SITE_URL}/about`,
    mainEntity: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      foundingDate: "2009",
      address: {
        "@type": "PostalAddress",
        addressRegion: "NJ",
        postalCode: "07675",
        addressCountry: "US",
      },
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(organisationJsonLd) }}
      />

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About MP MedPharma</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            A US supplier of new and certified refurbished ophthalmic, surgical and dental equipment,
            serving hospitals and clinics since 2009
          </p>
        </div>
      </div>

      <TrustBar />

      {/* Who we are */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=900&q=80"
                  alt="Surgical instruments prepared for a procedure"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              <div className="absolute -bottom-5 -right-5 bg-primary-600 text-white rounded-2xl px-5 py-4 shadow-xl hidden sm:block">
                <div className="text-2xl font-bold leading-none">Since 2009</div>
                <div className="text-xs text-blue-200 mt-1">Supplying eye care</div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-3">Who we are</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Capital equipment, bought the way clinicians would want to buy it
              </h2>
              <p className="text-gray-600 leading-relaxed mb-5">
                MP MedPharma is a New Jersey based supplier of new and certified refurbished medical
                equipment. Since 2009 we have worked with hospitals, eye clinics and surgery centers
                on the devices their lists depend on — phaco and vitrectomy platforms, refractive,
                retina and glaucoma lasers, OCT and diagnostic imaging, slit lamps and surgical
                microscopes.
              </p>
              <p className="text-gray-600 leading-relaxed mb-5">
                The catalogue now also serves dental practices, with integrated dental chair units for
                general, paediatric and multi-chair operatory fit-outs.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                A good deal on capital equipment is not the lowest number on a quote. It is knowing what
                was serviced, what is covered, who installs it and who answers when it stops working. That
                is the part we take seriously.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "New and certified refurbished ophthalmic, surgical and dental equipment",
                  "Documented service history and warranty on every unit",
                  "White-glove delivery, installation and clinical training",
                  "Fair, transparent offers on the equipment you are replacing",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-700">
                    <CheckCircle size={18} className="text-primary-600 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                >
                  Browse equipment <ArrowRight size={16} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-800 font-semibold rounded-xl border border-slate-200 hover:border-primary-300 hover:text-primary-600 transition-colors"
                >
                  Talk to us
                </Link>
              </div>
            </div>
          </div>

          {/* Stats — qualitative on purpose; see the note at the top of this file. */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-20">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center p-6 bg-primary-50 rounded-2xl border border-primary-100">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} />
                </div>
                <div className="text-xl font-bold text-primary-700 mb-1">{value}</div>
                <div className="text-sm text-gray-600">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we supply */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-3">What we supply</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-10">Equipment for the eye and the dental operatory</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {whatWeSupply.map((item) => (
              <Link
                key={item.heading}
                href={item.href}
                className="group bg-white rounded-2xl border border-slate-100 p-7 hover:shadow-lg hover:border-primary-200 transition-all"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{item.heading}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{item.body}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600">
                  Browse <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-3">How we work</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-10">What you should expect from a supplier</h2>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-9">
            {howWeWork.map((item) => (
              <div key={item.heading}>
                <h3 className="text-lg font-semibold text-slate-900 mb-2.5">{item.heading}</h3>
                <p className="text-slate-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-7">
            <h3 className="text-lg font-semibold text-slate-900 mb-2.5">Replacing equipment?</h3>
            <p className="text-slate-600 leading-relaxed mb-5">
              We buy pre-owned ophthalmic and surgical equipment and make transparent valuations, so
              the device you are retiring can offset the one you are bringing in. Tell us what you have
              and we will tell you what it is worth.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/sell-your-product"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                Sell your equipment <ArrowRight size={16} />
              </Link>
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-800 font-semibold rounded-xl border border-slate-200 hover:border-primary-300 hover:text-primary-600 transition-colors"
              >
                Read our buying guides
              </Link>
            </div>
          </div>

          <p className="flex items-center justify-center gap-2 text-sm text-slate-500 mt-12">
            <MapPin size={15} className="text-primary-600" />
            Based in New Jersey, USA — shipping to hospitals and clinics worldwide
          </p>
        </div>
      </section>
    </div>
  );
}
