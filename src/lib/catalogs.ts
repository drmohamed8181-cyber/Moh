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
};

export const CATALOGS: Catalog[] = [
  {
    specialty: "ophthalmology",
    name: "Ophthalmology",
    title: "Ophthalmic Equipment Catalog",
    file: "ophthalmology.pdf",
    href: "/catalog/ophthalmology.pdf",
    blurb: "Lasers, phaco and vitreoretinal systems, OCT and imaging, slit lamps, microscopes and diagnostics.",
  },
  {
    specialty: "dental",
    name: "Dental",
    title: "Dental Equipment Catalog",
    file: "dental.pdf",
    href: "/catalog/dental.pdf",
    blurb: "Dental chairs and treatment units.",
  },
];

export function catalogForSpecialty(specialty: string | undefined): Catalog | undefined {
  return CATALOGS.find((catalog) => catalog.specialty === specialty);
}

/** The catalog a category's equipment is listed in. */
export function catalogForCategory(categorySlug: string): Catalog {
  return catalogForSpecialty(DENTAL_CATEGORY_SLUGS.includes(categorySlug) ? "dental" : "ophthalmology")!;
}
