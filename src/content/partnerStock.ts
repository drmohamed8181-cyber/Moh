// The partner's (LaserLocators) current ophthalmology list, replaced weekly.
//
// Any ophthalmology product on this site that matches none of these entries is
// shown as "Sold – inquire for similar". Dental and other specialties are not
// affected. Entries can be LaserLocators page URLs or plain model names, one
// per line; matching is by model name (see src/lib/partnerStock.ts).
//
// While the list has fewer than MIN_PARTNER_ENTRIES entries it is treated as
// not yet provided and nothing is marked sold, so an empty or truncated paste
// can never mark the whole catalogue sold.
//
// Changes reach the site on the next deploy; cached pages catch up within an
// hour, or at once after any product is saved in the admin.

export const PARTNER_STOCK_UPDATED = "2026-11-12 (Laser Locators distributor list, mid-November 2026)";

// Our product slugs for every unit on that list. Slugs rather than the
// partner's wording, because the matcher treats one entry's words being a
// subset of a product's as a match: "Ellex Solitaire 532 LIO" would otherwise
// keep the sold Solitaire 532 laser listed.
export const PARTNER_STOCK: string[] = [
  "alcon-3000le-laserex-3000lx",
  "alcon-active-sentry-centurion-handpiece-refurbished",
  "alcon-centurion-vision-system",
  "alcon-constellation-vision-system",
  "alcon-luxor-lx3-microscope",
  "alcon-ozil-handpiece-for-centurion-infiniti-refurbished",
  "alcon-purepoint-532-lio",
  "alcon-vario-topolyzer",
  "alcon-wavelight-200hz-laser-cavity-refurbished",
  "alcon-wavelight-400hz-excimer",
  "alcon-wavelight-400hz-laser-cavity-refurbished",
  "alcon-wavelight-ex500-excimer-laser-usa",
  "amo-fx-phaco-handpiece-refurbished",
  "amo-visx-s4-ir-excimer-3xxx-sn",
  "amo-visx-s4-ir-excimer-5xxx-sn",
  "bausch-lomb-hansatome-microkeratome",
  "bausch-lomb-stellaris-pc-w-laser",
  "bausch-lomb-stellaris-phaco-handpiece-refurbished",
  "bausch-lomb-zyoptix-xp-microkeratome",
  "bausch-lomb-zyoptix-xp-microkeratome-system-complete",
  "coherent-aura-yag-laser",
  "coherent-lumenis-opal-pdt-laser",
  "cso-900-series-slit-lamp",
  "dexta-patient-bed-for-nidek-ec-5000",
  "dexta-patient-bed-for-visx-s4-ir",
  "ellex-eye-prime-b-scan-ubm-ultrasound",
  "ellex-solitaire-lio-indirect-ophthalmoscope",
  "ellex-solo-slt-laser",
  "ellex-super-q-yag-laser",
  "ellex-tango-slt-yag-laser",
  "ellex-ultra-q-reflex-yag-laser",
  "ellex-ultra-q-yag-laser",
  "endo-optiks-e2-ecp-laser",
  "iridex-532-810-lio",
  "iridex-cyclo-g6-laser",
  "iridex-iq-532-green-laser",
  "iridex-iq-532-txcell-slit-lamp-table",
  "iridex-oculight-glx-laser-with-cso-slit-lamp-table",
  "iridex-oculight-slx-810-laser-console",
  "iridex-oculight-slx-810-laser-with-lio",
  "iridex-oculight-slx-810-laser-with-slit-lamp-adapter",
  "iridex-oculight-tx-laser-console",
  "iridex-oculight-tx-laser-with-lio",
  "j-j-idesign-advanced-wavescan-studio",
  "j-j-intralase-ifs-150hz-femtosecond",
  "jj-intralase-fs60-model-2-femtosecond-laser",
  "johnson-johnson-whitestar-pro",
  "konan-cellchek-specular-microscope-stand-alone",
  "konan-cellchek-xl-specular-microscope",
  "laserex-lqp3106-yag-laser",
  "laserex-super-q-yag-laser",
  "lumenis-selecta-duet-slt-yag-laser-gen-1",
  "lumenis-selecta-duet-slt-yag-laser-gen-2",
  "lumenis-selecta-ii-slt-laser",
  "lumenis-selecta-smart-duet-slt-yag",
  "moria-evolution-3-microkeratome-console",
  "moria-evolution-3e-microkeratome-console",
  "moria-m2-metal-head-size-130",
  "nidek-mc-500-lio",
  "nidek-mc-500-multicolor-pattern-scanning-laser",
  "nidek-opd-scan-iii-ark-topographer",
  "nidek-yc-1600-yag-laser",
  "nidek-yc-1800-yag-laser",
  "scican-statim-2000-g4-sterilizer-new",
  "scican-statim-5000-g4-sterilizer-new",
  "topcon-pascal-streamline-532-pattern-scanning-laser",
  "zeiss-atlas-500-corneal-topographer",
  "zeiss-atlas-9000-topographer-windows-10",
  "zeiss-atlas-9000-topographer-windows-11",
  "zeiss-atlas-9000-topographer-windows-xp",
  "zeiss-cirrus-oct-4000-quad-core",
  "zeiss-cirrus-oct-500",
  "zeiss-cirrus-oct-5000",
  "zeiss-cirrus-oct-5000-angioplex",
  "zeiss-cirrus-oct-6000-angioplex",
  "zeiss-clarus-500-fundus-camera",
  "zeiss-clarus-700-fundus-camera",
  "zeiss-humphrey-hfa-750i-visual-field-analyzer",
  "zeiss-iolmaster-500-optical-biometer",
  "zeiss-visu-200-microscope-on-s8-rolling-stand",
  "zeiss-visulas-532-laser-with-lsl-slit-lamp-previous-model",
  "zeiss-visulas-532s-laser-console",
  "zeiss-visulas-532s-laser-with-lio",
  "zeiss-visulas-532s-laser-with-lsl-slit-lamp",
  "zeiss-visulas-532s-laser-with-slit-lamp-adapter",
  "zeiss-visulas-532s-lio",
  "zeiss-visulas-combi-yag-iii-532s-laser",
  "zeiss-visulas-green-532-lio",
  "zeiss-visulas-yag-iii-laser",
  "ziemer-femto-ldv-z4-femtosecond-laser",
  "ziemer-femto-ldv-z8-femtosecond-laser",
];
