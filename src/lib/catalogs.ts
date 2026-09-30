import type { CatalogPdfIntro } from "@/lib/catalogPdf";
import type { CatalogSpecialty } from "@/lib/publicData";
import { DENTAL_CATEGORY_SLUGS } from "@/lib/specialties";

// The downloadable PDF catalogs, one per live specialty. The file name is the
// last path segment served by src/app/catalog/[file]/route.ts; printed QR
// codes point at those URLs, so they must not change.
export type Catalog = {
  specialty: CatalogSpecialty;
  name: string;
  title: string;
  file: string;
  href: string;
  blurb: string;
  /** The cover tagline and "What we supply" copy, taken from the About page. */
  intro: CatalogPdfIntro;
};

export const CATALOGS: Catalog[] = [
  {
    specialty: "ophthalmology",
    name: "Ophthalmology",
    title: "Ophthalmic Equipment Catalog",
    file: "ophthalmology.pdf",
    href: "/catalog/ophthalmology.pdf",
    blurb: "Lasers, phaco and vitreoretinal systems, OCT and imaging, slit lamps, microscopes and diagnostics.",
    intro: {
      tagline: "New and certified refurbished ophthalmic equipment for hospitals, eye clinics and surgery centers.",
      supply: [
        {
          heading: "Cataract & refractive surgery",
          body: "Phacoemulsification and vitreoretinal platforms, excimer and femtosecond lasers, microkeratomes and topographers.",
        },
        {
          heading: "Lasers & diagnostics",
          body: "SLT and YAG lasers, retina and glaucoma photocoagulation, OCT and diagnostic imaging, slit lamps and surgical microscopes.",
        },
      ],
      tradeIn: true,
    },
  },
  {
    specialty: "dental",
    name: "Dental",
    title: "Dental Equipment Catalog",
    file: "dental.pdf",
    href: "/catalog/dental.pdf",
    blurb: "Dental chairs and treatment units.",
    intro: {
      tagline: "Integrated dental chair units for general, paediatric and multi-chair practice.",
      supply: [
        {
          heading: "Dental operatory",
          body: "Integrated dental chair units: patient chair, delivery system, operating light and assistant side, for general, paediatric and multi-chair practice.",
        },
      ],
      // The About page's trade-in offer covers ophthalmic and surgical equipment only.
      tradeIn: false,
    },
  },
];

export function catalogForSpecialty(specialty: string | undefined): Catalog | undefined {
  return CATALOGS.find((catalog) => catalog.specialty === specialty);
}

/** The catalog a category's equipment is listed in. */
export function catalogForCategory(categorySlug: string): Catalog {
  return catalogForSpecialty(DENTAL_CATEGORY_SLUGS.includes(categorySlug) ? "dental" : "ophthalmology")!;
}

// Brands kept out of every PDF catalog whatever category their products sit
// in. A PDF can't be recalled once it's printed or forwarded, so this guards
// against a listing being filed under a public category by mistake: LightMed
// stays out until its distributor agreement is signed (its dental laser line
// is withheld from the site for the same reason, see HIDDEN_CATEGORY_SLUGS).
const WITHHELD_BRANDS = ["lightmed"];

/** Whether a product's name or manufacturer names a withheld brand. */
export function isWithheldFromCatalog(product: { name: string; manufacturer: string | null }): boolean {
  const text = `${product.name} ${product.manufacturer ?? ""}`.toLowerCase().replace(/[^a-z0-9]/g, "");
  return WITHHELD_BRANDS.some((brand) => text.includes(brand));
}
