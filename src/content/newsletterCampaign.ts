// The current one-off inventory newsletter, sent from Admin → Newsletter.
// Change `id` for each new campaign: recipients already sent a campaign id
// never get that id again. Products are listed by slug and read live at send
// time; any that are no longer available (or sold) are left out automatically.
// Prices are never included (site rule: no prices in customer email).

export const NEWSLETTER_CAMPAIGN = {
  id: "2026-11-inventory",
  title: "November 2026 inventory update",
  featuredSlug: "alcon-wavelight-ex500-excimer-laser-usa",
  newSlugs: [
    "zeiss-cirrus-oct-6000-angioplex",
    "nidek-opd-scan-iii-ark-topographer",
    "coherent-lumenis-opal-pdt-laser",
    "iridex-iq-532-txcell-slit-lamp-table",
    "zeiss-visulas-532s-laser-with-slit-lamp-adapter",
  ],
  updatedSlugs: [
    "alcon-luxor-lx3-microscope",
    "zeiss-visu-200-microscope-on-s8-rolling-stand",
    "zeiss-clarus-700-fundus-camera",
    "topcon-pascal-streamline-532-pattern-scanning-laser",
    "alcon-centurion-vision-system",
  ],
  // The Cirrus 6000 listing shows a Cirrus 5000 photo; leave it out of the
  // email until a verified 6000 photo is on the listing.
  hideImageSlugs: ["zeiss-cirrus-oct-6000-angioplex"],
};
