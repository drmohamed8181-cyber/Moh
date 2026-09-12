// Buying and selling guides: the content-marketing half of getting found.
//
// Each guide targets a question buyers actually type into a search engine and
// links back into the catalogue (brand and category pages, the sell-your-
// product form). They are plain data rendered by src/app/(shop)/guides so a
// new guide is a new entry here, nothing more. Keep every claim general and
// true of the device class; specific specifications belong on product pages.

export type GuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type Guide = {
  slug: string;
  title: string;
  /** Meta description and card blurb; keep under ~160 characters. */
  description: string;
  /** ISO date, shown on the page and used in Article markup. */
  publishedAt: string;
  intro: string;
  sections: GuideSection[];
  /** Internal links shown at the end of the guide. */
  related: { label: string; href: string }[];
};

export const GUIDES: Guide[] = [
  {
    slug: "refurbished-vs-new-ophthalmic-equipment",
    title: "Refurbished vs New Ophthalmic Equipment: What Actually Differs",
    description:
      "What certified refurbished really means for phaco systems, lasers and OCT, where the savings come from, and when buying new is still the right call.",
    publishedAt: "2026-09-12",
    intro:
      "Most practices buying a phaco system, a laser or an OCT weigh the same question: is a certified refurbished unit a smart saving or a false economy? The honest answer depends on the device class, the age of the platform and who did the refurbishment. This guide lays out the differences that matter.",
    sections: [
      {
        heading: "What \"certified refurbished\" should mean",
        paragraphs: [
          "A refurbished unit is a pre-owned device that has been inspected, serviced, had worn or consumable parts replaced, been recalibrated and been tested against the manufacturer's performance specifications before resale. \"Certified\" adds a documented record of that work, a warranty and a stated service history.",
          "The word alone guarantees nothing. Ask for the checklist that was followed, the parts that were replaced, the calibration report and the name of the engineer or service organisation. A supplier who cannot produce those documents is selling a used device, not a refurbished one.",
        ],
      },
      {
        heading: "Where the savings come from",
        paragraphs: [
          "Ophthalmic capital equipment loses a large share of its list price in the first years of ownership while its clinical performance barely changes. A phaco platform or a YAG laser from a well-supported product line does the same job in year six as in year one, provided it has been maintained. Refurbished pricing captures that gap.",
          "The saving is largest on mature platforms with wide installed bases, because parts, consumables and trained engineers are plentiful. It is smallest on newly released systems, where the used market is thin and the manufacturer still controls most of the service.",
        ],
      },
      {
        heading: "When new is still the right call",
        paragraphs: [
          "Buy new when the procedure you want to offer depends on a capability that only the current generation provides, when the manufacturer has ended parts support for the prior generation, or when your payer or hospital contracts require a current-model device with a full manufacturer warranty.",
          "Buy refurbished when the platform is mature, the consumables are the same as for the new model, and the difference in price funds something else your practice needs, whether that is a second operating room, a diagnostic device or staff training.",
        ],
      },
      {
        heading: "Questions to ask any supplier",
        paragraphs: ["Before you sign, get written answers to the following. The answers separate a serious refurbisher from a broker."],
        bullets: [
          "What is the manufacturing date and the hours or shot count on the unit?",
          "Which parts were replaced during refurbishment, and are they OEM?",
          "Who performed the calibration, and can I see the report?",
          "What does the warranty cover, for how long, and who services the unit locally?",
          "Are consumables, handpieces, footswitches and software licences included?",
          "Can I see the unit running, in person or on a live video demo, before paying?",
        ],
      },
      {
        heading: "How MP MedPharma handles it",
        paragraphs: [
          "Every unit we list ships with its documented service history and warranty coverage, and we arrange a private demo before purchase on request. Pricing is quoted per unit because condition, configuration and included accessories differ. If you are replacing equipment, we also make offers on the device you are retiring.",
        ],
      },
    ],
    related: [
      { label: "Browse all equipment", href: "/products" },
      { label: "Shop by brand", href: "/brands" },
      { label: "Sell your used equipment", href: "/sell-your-product" },
    ],
  },
  {
    slug: "buying-a-used-excimer-laser-checklist",
    title: "What to Check Before Buying a Used Excimer Laser",
    description:
      "A practical checklist for pre-owned excimer and femtosecond refractive lasers: shot counts, gas and optics, software licences, room requirements and service support.",
    publishedAt: "2026-09-12",
    intro:
      "A refractive laser is the most demanding pre-owned purchase in ophthalmology. It is expensive to move, sensitive to its environment, and its value depends on parts that wear invisibly. This checklist covers what to verify before committing to a used excimer or femtosecond system.",
    sections: [
      {
        heading: "Usage history and consumable status",
        paragraphs: [
          "Excimer lasers age by use, not by calendar. Ask for the total pulse or procedure count and for the dates and counts at which the optics, the gas fill and the laser head or cavity were last serviced. Those components have finite lives, and a unit close to a major service interval is worth considerably less than one just past it.",
          "For femtosecond systems, ask the same about the laser source and the patient-interface consumables the platform requires, and confirm that those consumables are still manufactured and available to you.",
        ],
      },
      {
        heading: "Software, licences and treatment profiles",
        paragraphs: [
          "Many refractive platforms license treatment types separately: wavefront-guided, topography-guided, custom or cross-linking profiles may each require an activation that is tied to the unit or to the original owner. Confirm which licences transfer with the sale and which the manufacturer will require you to buy again.",
          "Check the software version against the current release and ask whether the unit is still eligible for updates. A platform frozen on old software may work perfectly and still block you from the treatments you plan to advertise.",
        ],
      },
      {
        heading: "Room, power and environment",
        paragraphs: [
          "Refractive lasers specify temperature and humidity ranges, air handling, floor loading and electrical supply. The unit you buy will only perform as tested if your room meets them. Get the site-preparation guide for the exact model and have your facility engineer sign it off before delivery, not after.",
        ],
      },
      {
        heading: "Diagnostics that must travel with the laser",
        paragraphs: [
          "A refractive workflow is a system: a topographer or aberrometer, a planning station and the laser itself. Confirm that the diagnostic device included, or the one you already own, is supported by the laser's software version. Buying a laser without its planning chain leaves you with an expensive light source.",
        ],
      },
      {
        heading: "Installation, calibration and support",
        paragraphs: ["Agree the following in writing before payment:"],
        bullets: [
          "Who de-installs, crates, ships and re-installs the unit, and who insures it in transit.",
          "Who performs the post-installation calibration and acceptance test, and against which specification.",
          "What the warranty covers and the response time for a service call at your location.",
          "Where spare parts come from and how long the manufacturer will continue supplying them.",
          "Whether clinical or application training for your surgeons and technicians is included.",
        ],
      },
      {
        heading: "Seeing it work",
        paragraphs: [
          "Ask to see the laser fire on test material, and to see the fluence and beam-profile checks the platform performs at start-up. MP MedPharma arranges private demos on request and provides the service documentation for every unit we sell, so those checks can be made before the purchase, not after delivery.",
        ],
      },
    ],
    related: [
      { label: "Alcon equipment", href: "/brands/alcon" },
      { label: "Browse all equipment", href: "/products" },
      { label: "Request a private demo", href: "/contact" },
    ],
  },
  {
    slug: "alcon-centurion-vs-infiniti",
    title: "Alcon Centurion vs Infiniti: What Changed and Which to Buy",
    description:
      "How the Alcon Centurion Vision System differs from the Infiniti it replaced, what the changes mean in surgery, and why the Infiniti still makes sense for some practices.",
    publishedAt: "2026-09-12",
    intro:
      "The Infiniti Vision System was the workhorse phaco platform of its generation, and the Centurion Vision System is its successor. Practices weighing a certified refurbished unit of either regularly ask us what the real differences are. Here is a plain summary.",
    sections: [
      {
        heading: "Fluidics: the central change",
        paragraphs: [
          "The Infiniti uses gravity-fed irrigation: the bottle height sets the pressure, and the surgeon manages chamber stability by adjusting it. The Centurion introduced Active Fluidics, which regulates intraocular pressure to a target the surgeon sets rather than relying on bottle height. In practice that means a more stable anterior chamber, especially at higher vacuum settings, and less surge after occlusion breaks.",
          "For high-volume cataract surgeons this is the reason to move to the Centurion. For surgeons comfortable with gravity fluidics and lower vacuum settings, the Infiniti still delivers excellent results.",
        ],
      },
      {
        heading: "Handpieces and ultrasound",
        paragraphs: [
          "Both platforms use torsional ultrasound through the OZil handpiece, which is one reason Infiniti units remained in service so long. The Centurion pairs it with its fluidics system and with a balanced tip design intended to make torsional motion more efficient. The handpiece ecosystem overlaps, but confirm which handpieces and tips are included with any unit you consider, because they represent a meaningful share of the value.",
        ],
      },
      {
        heading: "Interface, cassettes and consumables",
        paragraphs: [
          "The Centurion's console, footpedal and wireless remote were redesigned, and its fluidic management system uses its own cassette. Consumable costs and availability differ between the two platforms and should be part of the comparison: a lower purchase price on one unit can be offset by higher per-case consumable spend on the other.",
        ],
      },
      {
        heading: "Which to buy",
        paragraphs: [
          "Choose the Centurion if chamber stability at high vacuum, dense-nucleus efficiency and a current consumable ecosystem matter more than purchase price. Choose the Infiniti if you want a proven torsional platform at a lower entry cost, your case mix is routine, and you have reliable access to service and consumables for it.",
          "Either way, insist on the documented service history, the included handpieces and a demo before you buy. Both are available from MP MedPharma as certified refurbished units when in stock, with warranty coverage.",
        ],
      },
    ],
    related: [
      { label: "Alcon equipment", href: "/brands/alcon" },
      { label: "Browse all equipment", href: "/products" },
      { label: "Refurbished vs new equipment", href: "/guides/refurbished-vs-new-ophthalmic-equipment" },
    ],
  },
  {
    slug: "how-to-sell-used-ophthalmic-equipment",
    title: "How to Sell Used Ophthalmic Equipment: Valuation, Paperwork and Logistics",
    description:
      "How a pre-owned phaco system, laser or OCT is valued, what documents raise the offer, and how de-installation and shipping work when you sell to a dealer.",
    publishedAt: "2026-09-12",
    intro:
      "Upgrading a laser or a phaco platform usually leaves a working device in the corner of a room. Sold well, it funds a meaningful part of the replacement. This guide explains how dealers value used ophthalmic equipment and what you can do to get a better offer.",
    sections: [
      {
        heading: "What drives the offer",
        paragraphs: ["Three things set the price of a pre-owned ophthalmic device:"],
        bullets: [
          "Platform and generation: current or last-generation systems with active manufacturer support sell for far more than discontinued ones.",
          "Condition and usage: shot counts, procedure counts, service history and cosmetic condition all count, and a recent preventive-maintenance visit raises the offer.",
          "Completeness: handpieces, footswitches, remotes, tables, software licences and manuals. Missing accessories are deducted at replacement cost.",
        ],
      },
      {
        heading: "Documents that raise the offer",
        paragraphs: [
          "Gather the original purchase invoice, service records and calibration reports, the software version and licence details, and clear photographs of the unit, its screen at start-up and every accessory. A device with a complete file is worth more because the buyer can resell it as certified refurbished rather than as-is.",
        ],
      },
      {
        heading: "Selling to a dealer vs selling privately",
        paragraphs: [
          "A private sale to another practice can bring a higher headline price, but you carry the de-installation, shipping, warranty expectations and the risk that the buyer's room is not ready. A dealer offer is lower but firm: the dealer handles logistics, takes the device as it is and pays on collection. For most practices the dealer route costs less time and risk than the difference in price.",
        ],
      },
      {
        heading: "De-installation and shipping",
        paragraphs: [
          "Lasers and phaco systems should be de-installed by a trained engineer, crated in the manufacturer's recommended way and shipped insured. Agree in writing who arranges and pays for each step, and when ownership and risk transfer. Do not let a device leave the building without a signed collection note.",
        ],
      },
      {
        heading: "How our equipment acquisition program works",
        paragraphs: [
          "Submit the device through our Sell Your Product form with its model, condition and photographs. We reply with a valuation and, if you accept, arrange de-installation and collection. The offer is transparent about what it is based on, and you are free to decline it.",
        ],
      },
    ],
    related: [
      { label: "Sell your equipment", href: "/sell-your-product" },
      { label: "Browse replacement equipment", href: "/products" },
      { label: "Contact us", href: "/contact" },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
