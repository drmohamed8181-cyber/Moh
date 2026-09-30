import { Metadata } from "next";
import Link from "next/link";
import { FileText, RefreshCw, Tag } from "lucide-react";
import CatalogDownloadButton from "@/components/shop/CatalogDownloadButton";
import { CATALOGS } from "@/lib/catalogs";
import { getCatalogProducts } from "@/lib/publicData";

// Same cache window as the PDFs themselves; product writes expire the counts
// through PRODUCTS_TAG.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Equipment Catalogs (PDF)",
  description:
    "Download MP MedPharma's ophthalmic and dental equipment catalogs as PDFs, built from our current inventory of new and refurbished equipment.",
  alternates: { canonical: "/catalogs" },
};

/** Items per catalog, or null when the database can't be reached (the buttons still work). */
async function itemCounts(): Promise<(number | null)[]> {
  return Promise.all(
    CATALOGS.map((catalog) => getCatalogProducts(catalog.specialty).then((products) => products.length, () => null))
  );
}

export default async function CatalogsPage() {
  const counts = await itemCounts();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Equipment Catalogs</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Our current inventory in one PDF per specialty, to save, print or share with your team.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {CATALOGS.map((catalog, i) => (
            <div key={catalog.specialty} className="bg-white rounded-2xl border p-6 flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                  <FileText size={24} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{catalog.title}</h2>
                  {counts[i] !== null && (
                    <p className="text-sm text-gray-500">
                      {counts[i]} {counts[i] === 1 ? "item" : "items"} available
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6 flex-1">{catalog.blurb}</p>
              <div className="flex flex-wrap gap-3">
                <CatalogDownloadButton catalog={catalog} label="Open PDF catalog" />
                <Link
                  href={`/products?specialty=${catalog.specialty}`}
                  className="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-gray-700 rounded-xl hover:text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  Browse online
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-10 grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <RefreshCw size={18} className="text-primary-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p>Always current: each catalog is built from our live listings, so sold units drop out and new arrivals appear automatically.</p>
          </div>
          <div className="flex items-start gap-3">
            <Tag size={18} className="text-primary-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p>
              Pricing on request: tap any item in the PDF to see its full details, or{" "}
              <Link href="/contact" className="text-primary-600 font-medium hover:underline">contact us</Link> for a quote.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
