export const DENTAL_CATEGORY_SLUGS = ["dental-lasers"];

export const SPECIALTIES: { slug: string; name: string; comingSoon?: boolean }[] = [
  { slug: "ophthalmology", name: "Ophthalmology" },
  { slug: "dermatology", name: "Dermatology", comingSoon: true },
];

// Category slugs kept in the database but excluded from public storefront pages
// while their specialty is marked "coming soon". Still fully manageable in admin.
export const HIDDEN_CATEGORY_SLUGS = DENTAL_CATEGORY_SLUGS;
