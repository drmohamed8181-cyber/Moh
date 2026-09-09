// Which categories sit under which specialty. Ophthalmology is the default
// bucket: any category not claimed by another specialty belongs to it, so an
// ophthalmic category added in admin shows up without a code change here.
export const DENTAL_CATEGORY_SLUGS = ["dental-lasers", "dental-chairs"];

export const SPECIALTIES: { slug: string; name: string; comingSoon?: boolean }[] = [
  { slug: "ophthalmology", name: "Ophthalmology" },
  { slug: "dental", name: "Dental", comingSoon: true },
  { slug: "dermatology", name: "Dermatology", comingSoon: true },
];

// Category slugs kept in the database but excluded from public storefront pages.
// Still fully manageable in admin.
//
// The two lists can diverge (a dental category can be public while another
// dental category is withheld). Right now both dental lines are withheld and
// the Dental specialty shows as coming soon: the laser line until its
// distributor agreement is signed, the chair line until Dr. Mohamed releases
// it. Adding a slug here is all it takes to pull a category off the homepage,
// the product and category listings, search, its direct URLs, the public
// products API, the XML sitemap and the digest email.
export const HIDDEN_CATEGORY_SLUGS = ["dental-lasers", "dental-chairs"];

// Dental categories a visitor can actually reach — what the Dental specialty
// filter resolves to.
export const PUBLIC_DENTAL_CATEGORY_SLUGS = DENTAL_CATEGORY_SLUGS.filter(
  (slug) => !HIDDEN_CATEGORY_SLUGS.includes(slug)
);

// Categories that are not ophthalmic: everything spoken for by another
// specialty, plus anything withheld. Used to keep the Ophthalmology filter from
// scooping up the rest of the catalogue now that it is no longer the only
// visible specialty.
export const NON_OPHTHALMOLOGY_CATEGORY_SLUGS = [
  ...new Set([...DENTAL_CATEGORY_SLUGS, ...HIDDEN_CATEGORY_SLUGS]),
];
