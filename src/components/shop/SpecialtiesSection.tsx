import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { SPECIALTIES } from "@/lib/specialties";

const specialtyMeta: Record<
  string,
  { image: string; description: string; accent: string; button: string }
> = {
  ophthalmology: {
    image: "/devices/CSO-900-Slit-Lamp-Real.jpg",
    description: "YAG & Excimer Lasers, OCT Systems, Surgical Microscopes, Phaco & Vitrectomy, SLT Lasers and more",
    accent: "bg-blue-500",
    button: "bg-blue-600 hover:bg-blue-500",
  },
  dermatology: {
    image: "https://images.unsplash.com/photo-1689103722266-1f2f837145e7?w=900&q=80",
    description: "Laser & light-based devices for skin treatment — launching soon",
    accent: "bg-purple-500",
    button: "bg-purple-600 hover:bg-purple-500",
  },
};

export default function SpecialtiesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-2">Our Specialties</p>
            <h2 className="text-3xl font-bold text-slate-900">Browse by Category</h2>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
            All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
          {SPECIALTIES.map((s) => {
            const meta = specialtyMeta[s.slug];
            const inner = (
              <>
                <Image
                  src={meta.image}
                  alt={s.name}
                  fill
                  className={`object-cover transition-transform duration-500 ${s.comingSoon ? "grayscale blur-[2px] scale-105" : "group-hover:scale-105"}`}
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />

                {s.comingSoon && (
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-purple-600 text-white text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full">
                      <Clock className="w-3.5 h-3.5" /> Coming Soon
                    </span>
                    <span className="text-white/80 text-sm">Launching soon</span>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <span className={`block w-10 h-1 rounded-full mb-3 ${meta.accent}`} />
                  <h3 className="text-white text-2xl font-bold mb-2">{s.name}</h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-4">{meta.description}</p>
                  {!s.comingSoon && (
                    <span className={`inline-flex items-center gap-1.5 text-white text-sm font-semibold px-3 py-1.5 rounded-md transition-colors ${meta.button}`}>
                      Explore {s.name} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </>
            );

            return s.comingSoon ? (
              <div key={s.slug} className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-not-allowed">
                {inner}
              </div>
            ) : (
              <Link
                key={s.slug}
                href={`/products?specialty=${s.slug}`}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden block"
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
