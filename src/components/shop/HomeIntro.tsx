import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicBrand } from "@/lib/publicData";
import { GUIDES } from "@/content/guides";

// Server-rendered copy for the homepage. The hero slides and their headline
// come from the database and change with campaigns; this block is the stable,
// plain-text statement of what the business sells, for whom and from where —
// the part of the page a search engine (and a first-time visitor) needs to
// classify the site. Keep it factual: every claim here is also on /about.
export default function HomeIntro({ brands }: { brands: PublicBrand[] }) {
  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-3">
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-3">Ophthalmic Equipment Supplier</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-5">
              New &amp; certified refurbished ophthalmic equipment for hospitals, eye clinics and surgery centers
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              MP MedPharma is a US-based supplier of new and certified refurbished ophthalmic equipment. We carry cataract and
              refractive surgery systems, retina and glaucoma lasers, SLT and YAG lasers, OCT and diagnostic imaging, slit lamps
              and surgical microscopes from the manufacturers surgeons already trust.
            </p>
            <p className="text-slate-600 leading-relaxed mb-6">
              Every unit ships with documented service history and warranty coverage. Prices are quoted on request, private demos
              can be arranged before you buy, and we make fair, transparent offers on the equipment you are replacing.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                Browse Equipment <ArrowRight size={16} />
              </Link>
              <Link
                href="/sell-your-product"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-800 font-semibold rounded-xl border border-slate-200 hover:border-primary-300 hover:text-primary-600 transition-colors"
              >
                Sell Your Equipment
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Shop by Brand</h3>
              {brands.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {brands.map((brand) => (
                    <li key={brand.slug}>
                      <Link
                        href={`/brands/${brand.slug}`}
                        className="inline-block px-4 py-2 rounded-full bg-white border border-slate-200 text-sm text-slate-700 hover:border-primary-300 hover:text-primary-600 transition-colors"
                      >
                        {brand.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Brand pages are being updated.</p>
              )}
              <Link href="/brands" className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-primary-600 hover:underline">
                All brands <ArrowRight size={14} />
              </Link>
            </div>

            <div className="mt-6 bg-slate-50 rounded-2xl border border-slate-100 p-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Buying Guides</h3>
              <ul className="space-y-2.5">
                {GUIDES.slice(0, 3).map((guide) => (
                  <li key={guide.slug}>
                    <Link href={`/guides/${guide.slug}`} className="text-sm text-slate-700 hover:text-primary-600 transition-colors">
                      {guide.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/guides" className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-primary-600 hover:underline">
                All guides <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
