import Link from "next/link";
import Image from "next/image";
import { FileDown, RefreshCw, Printer, Share2 } from "lucide-react";
import { CATALOGS } from "@/lib/catalogs";
import { catalogHref } from "@/lib/catalogDownloads";

// Homepage banner inviting visitors to download the PDF catalogs. Each catalog
// is drawn as a small brochure cover, so it reads as a thing to take away
// rather than one more link. Links carry ?src=home for the download counts.
//
// Cover photos are the same product photos the Specialties section already
// shows, not manufacturer imagery.
const COVER_PHOTOS: Record<string, string> = {
  ophthalmology: "/devices/CSO-900-Slit-Lamp-Real.jpg",
  dental: "/devices/Dental-Chair-Unit-R4.webp",
};

export default function CatalogPromo({ counts }: { counts: (number | null)[] }) {
  return (
    <section className="bg-[#0F1B33] text-white relative overflow-hidden">
      <div aria-hidden="true" className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-gold-400/10 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-gold-400 text-[#0F1B33] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5">
            <FileDown size={14} aria-hidden="true" /> Free download
          </span>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Take our full equipment catalog with you
          </h2>
          <p className="text-slate-300 leading-relaxed mb-6 max-w-xl">
            Every unit we have available, with photos, in one PDF per specialty. Save it to your phone, print it
            for your next budget meeting, or share it with your team.
          </p>
          <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300 mb-8">
            <li className="flex items-center gap-2"><RefreshCw size={16} className="text-gold-400" aria-hidden="true" /> Updated automatically</li>
            <li className="flex items-center gap-2"><Printer size={16} className="text-gold-400" aria-hidden="true" /> Print-ready</li>
            <li className="flex items-center gap-2"><Share2 size={16} className="text-gold-400" aria-hidden="true" /> Easy to share</li>
          </ul>
          <Link href="/catalogs" className="text-sm font-semibold text-gold-400 hover:text-gold-300 underline-offset-4 hover:underline">
            All catalogs and how they work
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:gap-8 max-w-lg lg:ml-auto w-full">
          {CATALOGS.map((catalog, i) => (
            <a
              key={catalog.specialty}
              href={catalogHref(catalog.href, "home")}
              target="_blank"
              rel="noopener"
              className={`group block rounded-xl bg-white text-[#0F1B33] shadow-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:rotate-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400 ${
                i % 2 === 0 ? "-rotate-2" : "rotate-2 mt-6"
              }`}
            >
              <div className="bg-[#0F1B33] border-l-4 border-gold-400 px-3 py-3">
                <p className="text-[9px] uppercase tracking-widest text-gold-400 font-bold">MP MedPharma</p>
                <p className="font-display text-sm sm:text-base font-bold text-white leading-tight mt-1">{catalog.title}</p>
              </div>
              <div className="relative aspect-[4/3] bg-[#F8F6F1]">
                <Image
                  src={COVER_PHOTOS[catalog.specialty]}
                  alt=""
                  fill
                  className="object-contain p-3"
                  sizes="(max-width: 1024px) 45vw, 240px"
                />
              </div>
              <div className="px-3 py-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-slate-100">
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {counts[i] !== null ? `${counts[i]} items · PDF` : "PDF"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 group-hover:text-primary-600">
                  <FileDown size={14} aria-hidden="true" /> Download
                </span>
              </div>
              <span className="sr-only">Download the {catalog.name} catalog as a PDF (opens in a new tab)</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
