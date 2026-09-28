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
        ],
      },
      {
        heading: "How MP MedPharma handles it",
        paragraphs: [
          "Every unit we list ships with its documented service history and warranty coverage. Pricing is quoted per unit because condition, configuration and included accessories differ. If you are replacing equipment, we also make offers on the device you are retiring.",
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
          "Ask to see the fluence and beam-profile checks the platform performs at start-up. MP MedPharma provides the service documentation for every unit we sell, so those checks can be reviewed before the purchase, not after delivery.",
        ],
      },
    ],
    related: [
      { label: "Alcon equipment", href: "/brands/alcon" },
      { label: "Browse all equipment", href: "/products" },
      { label: "Contact us", href: "/contact" },
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
          "Either way, insist on the documented service history and the included handpieces before you buy. Both are available from MP MedPharma as certified refurbished units when in stock, with warranty coverage.",
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
  {
    slug: "how-to-choose-a-dental-chair-unit",
    title: "How to Choose a Dental Chair Unit: A Practice Owner's Guide",
    description:
      "Delivery style, ergonomics, plumbing and electrical requirements, what is really included in a quoted price, and the questions to settle before a dental chair unit ships.",
    publishedAt: "2026-09-14",
    intro:
      "A dental chair unit is the one purchase every appointment in the room depends on, and it stays for a decade or more. Most of the regret in this category comes not from picking the wrong brand but from settling the configuration questions too late. This guide covers the decisions in the order you should make them.",
    sections: [
      {
        heading: "Start with delivery style, not with the chair",
        paragraphs: [
          "The patient chairs across this market are more alike than different. What changes how the room works is the delivery system — where the handpieces are presented to the operator — and that is designed into the chassis rather than bolted on afterwards.",
          "Over-the-patient delivery puts instruments directly in reach and suits four-handed dentistry with a nurse. Side or swing-mounted delivery keeps the space in front of the patient open, which matters for anxious adults and for children who dislike equipment moving across their face. Cart-mounted delivery can be wheeled between rooms, which is the right answer for a practice still settling its layout or sharing equipment across surgeries.",
          "Decide this against how your team actually works today. Retrofitting a different delivery style usually means a different unit.",
        ],
      },
      {
        heading: "The two measurements that decide comfort",
        paragraphs: [
          "Lowest seat height governs access. It determines whether an elderly patient, a wheelchair transfer or a small child can get into the chair without help, and it is the specification most often skipped in a brochure comparison.",
          "Backrest thickness governs the operator. A slim backrest lets you bring your knees under the patient's head and work from a neutral seated posture; a thick one pushes you outward and into the reaching and twisting that accumulates into back and shoulder problems over a career. If you can see a unit in person, sit at it in your normal working position before looking at anything else.",
        ],
      },
      {
        heading: "Settle the services before you order",
        paragraphs: [
          "Installation problems are nearly always plumbing and electrical, and nearly always predictable.",
        ],
        bullets: [
          "Confirm the voltage, frequency, plug standard and the safety listing required where you practise. On imported equipment, get this in writing before ordering rather than discovering it at commissioning.",
          "Establish whether you are connecting to a central compressor and suction plant or need a self-contained bottle water supply and suction pump.",
          "Check the floor: box-mounted units need the service outlet positioned before the unit arrives, and moving it later means cutting the floor.",
          "Ask what commissioning includes, who performs it, and whether the price quoted is delivered and installed or delivered only.",
        ],
      },
      {
        heading: "Read what the quoted price actually contains",
        paragraphs: [
          "Two quotes for the same unit routinely differ by a wide margin because of what sits underneath the headline figure. The items most often excluded are the ones you cannot work without.",
        ],
        bullets: [
          "Handpiece tubings, and how many of each type.",
          "Three-way syringes, and whether they are heated.",
          "Scaler, curing light and intraoral camera — frequently listed as options.",
          "The operator's and assistant's stools.",
          "Shipping, customs handling, installation and the first service visit.",
        ],
      },
      {
        heading: "Warranty, parts and the long view",
        paragraphs: [
          "A chair unit is a ten-to-fifteen-year purchase, so the supply of parts matters more than the opening price. Ask how spare parts are ordered, what the typical lead time is, and who attends when the unit stops working. A cheaper unit that takes three weeks to get an upholstery panel or a control board for is not cheaper.",
          "Ask about upholstery separately. It is the first thing to wear, it is replaced at least once in the life of the chair, and whether a replacement set can still be bought in year eight tells you a lot about how long the platform will be supported.",
        ],
      },
      {
        heading: "How MP MedPharma handles it",
        paragraphs: [
          "Our dental chair units are new and are quoted per unit according to configuration, delivery style and the accessories you need, so the quote reflects the room rather than a list price. Tell us how your team works and how the surgery is plumbed and we will specify against that. Warranty coverage applies to every unit we supply.",
        ],
      },
    ],
    related: [
      { label: "Browse dental chair units", href: "/categories/dental-chairs" },
      { label: "All equipment", href: "/products" },
      { label: "Contact us", href: "/contact" },
    ],
  },
  {
    slug: "slt-vs-yag-laser-which-to-buy-first",
    title: "SLT vs YAG Laser: Which Should Your Practice Buy First?",
    description:
      "How SLT and Nd:YAG lasers differ, which procedures each is used for, and when a combination SLT/YAG platform is the better buy for a growing ophthalmology practice.",
    publishedAt: "2026-09-25",
    intro:
      "SLT and YAG lasers often sit side by side in the same room, and many practices adding their first anterior-segment laser ask which one to buy first. They are related technologies with different jobs. This guide explains the difference and how to decide.",
    sections: [
      {
        heading: "Two lasers, two jobs",
        paragraphs: [
          "A YAG laser is a Q-switched Nd:YAG laser working at 1064 nm. It is a photodisruptor: it creates a tiny, precisely placed optical breakdown inside the eye. Its everyday uses are posterior capsulotomy after cataract surgery and peripheral iridotomy.",
          "An SLT laser performs selective laser trabeculoplasty, a glaucoma procedure that treats the trabecular meshwork. It uses a frequency-doubled Q-switched Nd:YAG at 532 nm with a large spot and low energy. It is a different instrument with a different delivery system, even though the laser source is related.",
          "Which procedures a particular unit is cleared for is set by its manufacturer's labeling. Check that labeling for the exact model you are considering.",
        ],
      },
      {
        heading: "Start from your case mix",
        paragraphs: [
          "If your practice performs cataract surgery, or refers many post-cataract patients back to you, a YAG laser is usually the first purchase. Capsulotomy volume follows cataract volume, and sending those patients elsewhere costs you the follow-up relationship.",
          "If your practice manages a large glaucoma population, an SLT laser lets you offer trabeculoplasty in-house rather than referring it out. Look at how many trabeculoplasty referrals you made last year before deciding.",
        ],
      },
      {
        heading: "When a combination platform makes sense",
        paragraphs: [
          "Combination SLT/YAG platforms put both lasers in one slit-lamp delivery system. They save a room and a slit lamp, and they are often the better value when you expect to need both within a few years.",
          "The trade-off is that the whole platform is out of service when either laser is. A practice with high volume on both procedures may prefer two dedicated units so a service visit never stops both. Examples in our catalogue include the Ellex Tango and Tango Reflex and the Lumenis Selecta Duet, alongside dedicated units such as the Ellex Ultra Q YAG and the Ellex Solo and Lumenis Selecta II SLT lasers.",
        ],
      },
      {
        heading: "What to check on a pre-owned unit",
        paragraphs: ["Both types are durable and well suited to the refurbished market, provided you verify the following:"],
        bullets: [
          "Energy output measured against specification at the time of refurbishment, with the report.",
          "The shot count or usage history the unit records, where available.",
          "The condition of the slit lamp optics, the aiming beam and the joystick. These are what the surgeon feels every day.",
          "Which contact lenses, table and footswitch are included.",
          "The electrical requirements, and the laser safety measures the room will need.",
        ],
      },
      {
        heading: "How MP MedPharma can help",
        paragraphs: [
          "Tell us your procedure volumes and your room layout and we will suggest a dedicated unit or a combination platform to match. Every laser we sell ships with its service documentation and warranty coverage, and pricing is quoted per unit.",
        ],
      },
    ],
    related: [
      { label: "SLT lasers", href: "/categories/slt-lasers" },
      { label: "YAG lasers", href: "/categories/yag-lasers" },
      { label: "Ellex equipment", href: "/brands/ellex" },
      { label: "Lumenis equipment", href: "/brands/lumenis" },
    ],
  },
  {
    slug: "buying-a-used-oct-zeiss-cirrus-guide",
    title: "Buying a Used OCT: Zeiss Cirrus 4000 vs 5000 vs AngioPlex",
    description:
      "What separates the Zeiss Cirrus OCT generations, what drives the price of a pre-owned OCT, and what to check on software, licences and the review station before you buy.",
    publishedAt: "2026-09-25",
    intro:
      "An OCT is now a routine diagnostic in most ophthalmology and many optometry practices, and the Zeiss Cirrus family is one of the most common platforms on the pre-owned market. The generations look alike but differ in ways that affect both price and what the device can do for you. This guide sets out what to compare.",
    sections: [
      {
        heading: "What drives the price of a used OCT",
        paragraphs: ["Four things account for most of the difference between two pre-owned OCTs:"],
        bullets: [
          "Generation: newer platforms run current software and stay eligible for updates for longer.",
          "Licensed analysis modules: the analyses a unit can run are software licences. Two identical-looking units can differ greatly in what they offer.",
          "Included equipment: the instrument table, the review computer, the printer and any network licences.",
          "Documentation: service history and a recent calibration raise the value.",
        ],
      },
      {
        heading: "Cirrus 4000 vs Cirrus 5000",
        paragraphs: [
          "The Cirrus HD-OCT 4000 is the earlier generation. It remains a capable spectral-domain OCT for retinal and optic-nerve imaging, and it is the lowest-cost way into the Cirrus ecosystem. Before buying, confirm the highest software version the unit can run and whether that version supports the analyses and data export your practice needs.",
          "The Cirrus HD-OCT 5000 is the later generation. It runs newer software and supports a wider range of analysis options. It usually costs more, and for a practice planning to keep the device for many years it is often the better long-term buy.",
        ],
      },
      {
        heading: "What AngioPlex adds",
        paragraphs: [
          "AngioPlex is Zeiss's OCT angiography option on the Cirrus 5000 platform. It builds images of retinal blood flow from repeated OCT scans, without dye injection. For retina-focused practices it is often the deciding feature. For general practices it may be capability they rarely use, so compare the price difference against how often you would order the scan.",
          "AngioPlex is a licensed capability tied to the unit. Confirm in writing that it is active on the device you are buying and that it transfers with the sale.",
        ],
      },
      {
        heading: "Anterior segment imaging",
        paragraphs: [
          "The Cirrus platforms are primarily posterior-segment devices. Practices that mainly need anterior chamber and angle imaging, for example for refractive or glaucoma work, may also consider a dedicated anterior-segment OCT such as the Zeiss Visante.",
        ],
      },
      {
        heading: "Before you buy",
        paragraphs: ["Get written answers to the following:"],
        bullets: [
          "Serial number, manufacturing date and installed software version.",
          "The full list of active licences and analysis modules, and confirmation that each one transfers.",
          "Whether the existing patient database will be wiped. It must be, and you should get it in writing, because patient data cannot travel with the device.",
          "Whether the review station, table and any network licences are included.",
          "Who installs and calibrates the unit, and what the warranty covers.",
        ],
      },
    ],
    related: [
      { label: "Diagnostic equipment", href: "/categories/diagnostic-equipment" },
      { label: "Zeiss equipment", href: "/brands/zeiss" },
      { label: "Refurbished vs new equipment", href: "/guides/refurbished-vs-new-ophthalmic-equipment" },
      { label: "Contact us", href: "/contact" },
    ],
  },
  {
    slug: "buying-a-used-ophthalmic-surgical-microscope",
    title: "Buying a Used Ophthalmic Surgical Microscope: What to Check",
    description:
      "How to evaluate a pre-owned ophthalmic surgical microscope: optics, red reflex illumination, stand type, camera integration and what a proper refurbishment covers.",
    publishedAt: "2026-09-25",
    intro:
      "The surgical microscope is the instrument a cataract or retina surgeon looks through for every minute of every case. A good pre-owned microscope can serve for many years, but optics and mechanics wear in ways that are easy to miss in a showroom. This guide covers what to evaluate.",
    sections: [
      {
        heading: "Optics come first",
        paragraphs: [
          "Look through the unit at full and minimum magnification and across the whole field. The image should be sharp to the edges, free of haze, and both eyepieces should merge into one image without strain. Haze usually points to contaminated or degraded internal optics. That can be corrected, but it belongs in the refurbishment, not after delivery.",
          "Check the zoom and focus motors across their full range. They should move smoothly and quietly, without hunting or stalling.",
        ],
      },
      {
        heading: "Illumination and red reflex",
        paragraphs: [
          "For cataract surgery, a stable red reflex is one of the most valued features of an ophthalmic microscope. Different platforms approach it differently: the Alcon LuxOR line, for example, is built around red reflex illumination, and Zeiss ophthalmic microscopes such as the OPMI Visu series have their own coaxial illumination designs.",
          "On a pre-owned unit, check the light source type, the lamp hours where recorded, and whether a spare lamp is included. Also confirm that any illumination modules or filters listed in the specification are actually installed.",
        ],
      },
      {
        heading: "Stand, balance and mobility",
        paragraphs: [
          "Floor stands, ceiling mounts and wall mounts each suit a different room. A floor stand is the easiest to install and to move between rooms. A ceiling mount frees floor space but needs a structural assessment and professional installation.",
          "Whatever the mount, the arm should hold its position when balanced and move without drift. Check the brakes and the footswitch functions, including zoom, focus and XY movement where fitted.",
        ],
      },
      {
        heading: "Accessories and video",
        paragraphs: [
          "Assistant scopes, beam splitters, camera adapters, a video system and a retina viewing system add real value, and they are often the difference between two quotes. List exactly what is included. For teaching or documentation, confirm that the camera output works with your recording system.",
        ],
      },
      {
        heading: "What a proper refurbishment covers",
        paragraphs: ["Ask the supplier to confirm, in writing, that the refurbishment included:"],
        bullets: [
          "Cleaning and inspection of the optics, with any damaged elements replaced.",
          "Testing of the illumination, zoom, focus and XY motors across their full range.",
          "Inspection of the arm, brakes, cables and footswitch.",
          "Electrical safety testing.",
          "A warranty, and a named service contact for your area.",
        ],
      },
      {
        heading: "How MP MedPharma can help",
        paragraphs: [
          "Tell us your procedure mix and your room, and we will match a microscope and mounting option to it. Every unit ships with its service documentation and warranty coverage, and pricing is quoted per unit according to configuration.",
        ],
      },
    ],
    related: [
      { label: "Surgical microscopes", href: "/categories/surgical-microscopes" },
      { label: "Zeiss equipment", href: "/brands/zeiss" },
      { label: "Alcon equipment", href: "/brands/alcon" },
      { label: "Contact us", href: "/contact" },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
