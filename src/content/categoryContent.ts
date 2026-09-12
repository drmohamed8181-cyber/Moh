// Editorial content for the category pages.
//
// Why this exists: Search Console shows the site drawing impressions for
// generic equipment-class queries — "premium surgical microscope" (24
// impressions), "surgical microscope" (6), "femtosecond laser price" (3),
// "how much does a femtosecond laser cost" (13), "microkeratome" (2),
// "topography machine" (2) — at average positions between 60 and 90. Google
// judges the site relevant to those searches and ranks it on page six.
//
// The category page is what should answer them, and it had a heading, a
// one-line description from the database and a grid of tiles. There was
// nothing on it for a search engine to conclude the page was worth reading,
// and nothing for a buyer either.
//
// Each entry adds what a buyer weighing that class of device actually needs:
// what the equipment does, how the main variants differ, and what to check
// before buying pre-owned. Written to be true of the device class generally;
// per-unit facts belong on the product page.

export type CategoryContent = {
  /** Matches Category.slug. */
  slug: string;
  /** One or two sentences, shown under the heading in place of the database description. */
  summary: string;
  /** "How to choose" body copy. */
  sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
};

const WARRANTY_NOTE =
  "Every unit MP MedPharma sells, new or certified refurbished, comes with documented service history and warranty coverage, and a private demo can be arranged before purchase.";

export const CATEGORY_CONTENT: CategoryContent[] = [
  {
    slug: "surgical-microscopes",
    summary:
      "Ophthalmic surgical microscopes for cataract, retina, cornea and glaucoma procedures, from established platforms with apochromatic optics, coaxial red-reflex illumination and motorised focus, zoom and XY positioning.",
    sections: [
      {
        heading: "What matters in an ophthalmic surgical microscope",
        paragraphs: [
          "The single feature that separates ophthalmic microscopes from general surgical ones is the quality and stability of the red reflex. Coaxial illumination that keeps the reflex wide and steady through eye movement and decentration is what surgeons rely on during capsulorhexis and cortex removal, and it is the reason a microscope designed for eye surgery cannot be substituted with a general-purpose stand.",
          "Beyond the optics, the stand does most of the day-to-day work. Motorised focus, zoom and XY positioning, a well-counterbalanced arm and smooth braking determine how quickly a surgeon can recentre between steps and how steady the view stays for the rest of the case.",
        ],
      },
      {
        heading: "What to check on a pre-owned microscope",
        paragraphs: ["Optics and mechanics age differently, so inspect them separately."],
        bullets: [
          "Look through every eyepiece at high magnification for haze, fungus or coating delamination. Optical faults are the expensive kind.",
          "Run the motorised focus, zoom and XY through their full travel and listen for hesitation or backlash.",
          "Check the arm's counterbalance and brakes: a head that drifts will not hold position through a case.",
          "Ask for the illumination hours and whether the bulb or LED module has been replaced.",
          "Confirm what is included: assistant scope, beam splitter, video camera and recorder, foot control, and the floor stand itself.",
        ],
      },
      {
        heading: "Buying new or refurbished",
        paragraphs: [
          "Microscopes are among the best pre-owned purchases in ophthalmology. The optics do not degrade with use the way a laser source does, mature platforms stay well supported, and a serviced unit performs to the same specification it did new. Buying new makes sense mainly when you need a current-generation feature such as integrated intraoperative OCT or a heads-up display.",
          WARRANTY_NOTE,
        ],
      },
    ],
  },
  {
    slug: "phaco-vitrectomy",
    summary:
      "Phacoemulsification and vitreoretinal surgical platforms for cataract and retina procedures, including combined consoles that run both anterior and posterior segment cases from one system.",
    sections: [
      {
        heading: "Fluidics is the real differentiator",
        paragraphs: [
          "Modern phaco platforms differ less in ultrasound power than in how they control the eye. Gravity-fed systems set intraocular pressure by bottle height and ask the surgeon to manage chamber stability directly. Actively regulated systems hold pressure to a target the surgeon sets, which shows up as a more stable anterior chamber and less surge after an occlusion breaks, particularly at higher vacuum.",
          "Whether that difference justifies the price gap depends on your case mix. High-volume surgeons and those handling dense nuclei feel it on every list. For routine cataract work at moderate vacuum, a well-maintained gravity-fluidics platform still produces excellent results at a fraction of the cost.",
        ],
      },
      {
        heading: "Combined anterior and posterior consoles",
        paragraphs: [
          "Platforms that pair phacoemulsification with high-speed vitrectomy let one console serve both cataract and retina lists, and often add integrated illumination and an optional laser. For a surgical centre running mixed lists that consolidates equipment, room space and training onto one system.",
          "When buying one pre-owned, establish exactly which modules are fitted and licensed. A console sold as a combined platform may arrive without the posterior module, the laser or the illumination source, and those are not inexpensive to add later.",
        ],
      },
      {
        heading: "What to check before buying",
        paragraphs: ["Handpieces and consumables carry much of the value on these systems."],
        bullets: [
          "Which handpieces are included, and their service and tuning history.",
          "Which fluidics cassette or pack the system takes, and whether it is still manufactured and available to you.",
          "Software version, and which surgeon settings and procedure modes are licensed.",
          "Footpedal, remote and cart, which are frequently missing from resold consoles.",
          "For combined systems, the vitrectomy probe gauges the installed software supports.",
          WARRANTY_NOTE,
        ],
      },
    ],
  },
  {
    slug: "excimer-lasers",
    summary:
      "Excimer laser platforms for LASIK, PRK and surface ablation, with eye tracking and wavefront-optimised, wavefront-guided or topography-guided treatment profiles.",
    sections: [
      {
        heading: "How excimer platforms differ",
        paragraphs: [
          "Excimer lasers are compared on three things: pulse rate, which sets how long an ablation takes; the tracking system, which keeps the treatment centred as the eye moves and, on better systems, compensates for cyclotorsion between the diagnostic capture and the treatment; and the treatment profiles the platform is licensed to deliver.",
          "That third point is where pre-owned purchases go wrong. Wavefront-guided, topography-guided and custom profiles are frequently licensed separately and tied to the unit or to its original owner. A laser can be in perfect condition and still be unable to perform the treatments you intend to advertise.",
        ],
      },
      {
        heading: "The diagnostic chain is part of the purchase",
        paragraphs: [
          "A refractive laser does not work alone. It needs a topographer or aberrometer and a planning station whose software version the laser accepts. Buying a laser without a compatible diagnostic device leaves you with an expensive light source, so confirm the whole chain before committing.",
        ],
      },
      {
        heading: "What to check on a used excimer laser",
        paragraphs: ["This is the most demanding pre-owned purchase in ophthalmology. Get written answers to all of the following."],
        bullets: [
          "Total pulse or procedure count, and the dates and counts at the last optics and gas service.",
          "Which treatment licences transfer with the sale, and which the manufacturer will require you to buy again.",
          "Software version, and whether the unit is still eligible for updates.",
          "Room requirements: temperature, humidity, air handling, floor loading and electrical supply, signed off by your facility engineer before delivery.",
          "Who de-installs, ships, re-installs and calibrates the unit, and against which acceptance specification.",
        ],
      },
      {
        heading: "Before you commit",
        paragraphs: [
          "Ask to see the laser fire on test material and to watch the fluence and beam-profile checks it runs at start-up. Our guide on buying a used excimer laser covers the full checklist. " + WARRANTY_NOTE,
        ],
      },
    ],
  },
  {
    slug: "femtosecond-lasers",
    summary:
      "Femtosecond laser platforms for LASIK flap creation, corneal tunnels, lamellar and penetrating keratoplasty cuts, and cataract procedures.",
    sections: [
      {
        heading: "What a femtosecond laser adds",
        paragraphs: [
          "Femtosecond flap creation gives more predictable flap thickness and geometry than a mechanical microkeratome, and lets the surgeon programme diameter, depth, hinge position and side-cut angle per patient. Depending on platform and licensing the same laser also cuts intracorneal ring segment tunnels, lamellar and penetrating keratoplasty profiles, and corneal inlay pockets.",
          "Platforms differ in repetition rate, pulse energy and whether the unit is fixed or mobile. Lower-energy, higher-frequency systems are designed to leave a smoother stromal bed; mobile designs can serve more than one operating room, which changes the economics for a practice running several sites.",
        ],
      },
      {
        heading: "What a femtosecond laser costs",
        paragraphs: [
          "There is no single list price, and anyone quoting one without seeing the unit is guessing. What a pre-owned femtosecond laser is worth turns on the laser source's service history and remaining life, the procedures currently licensed on it, the software version and whether it still receives updates, and the per-case cost and availability of the patient interface consumables it requires.",
          "Those consumables deserve particular attention. A low purchase price on a platform with expensive or discontinued interfaces is not a saving. Ask for a per-case consumable cost before comparing two systems on headline price, and ask us for a quote on the specific unit rather than a category estimate.",
        ],
      },
      {
        heading: "What to check before buying",
        paragraphs: [],
        bullets: [
          "Laser source service history, and hours or procedure count since the last major service.",
          "Which procedures are licensed on this specific unit, and which transfer to a new owner.",
          "Patient interface consumable supply: still manufactured, and at what cost per case.",
          "Room temperature, humidity and electrical requirements, confirmed against your site.",
          "Installation, calibration, acceptance testing and local service response times, agreed in writing.",
          WARRANTY_NOTE,
        ],
      },
    ],
  },
  {
    slug: "yag-lasers",
    summary:
      "Nd:YAG photodisruption lasers for posterior capsulotomy and peripheral iridotomy, delivered through an integrated or slit-lamp-mounted system with a coaxial aiming beam.",
    sections: [
      {
        heading: "A straightforward, long-lived device class",
        paragraphs: [
          "A YAG laser is among the simplest and most durable pieces of capital equipment an eye clinic owns. The technology has been stable for decades, the installed base is large, and a serviced unit from a mature product line performs the same job as a current model. That makes this one of the safest categories to buy pre-owned.",
          "Platforms differ mainly in beam profile and in how the optical path is arranged. Systems designed to deliver tightly controlled, lower-energy pulses aim to reduce lens pitting and collateral disruption, and some designs switch between the slit-lamp illumination and laser paths to improve visualisation of the capsule.",
        ],
      },
      {
        heading: "What to check on a used YAG",
        paragraphs: [],
        bullets: [
          "Energy calibration against specification, with a recent report.",
          "Aiming beam alignment and brightness, checked at several energy settings.",
          "Slit-lamp optics, illumination and the condition of the focusing mechanism.",
          "Included safety filter, table and chin rest.",
          "Whether the unit is a combined SLT and YAG system, which changes both its value and what it can treat.",
          WARRANTY_NOTE,
        ],
      },
    ],
  },
  {
    slug: "slt-lasers",
    summary:
      "Selective laser trabeculoplasty systems for open-angle glaucoma and ocular hypertension, as dedicated SLT units or combined SLT and YAG platforms.",
    sections: [
      {
        heading: "Dedicated SLT or a combined platform",
        paragraphs: [
          "Selective laser trabeculoplasty is well established as a first-line option in open-angle glaucoma, and the laser itself is comparatively simple: frequency-doubled pulses delivered through a slit lamp at a fixed spot size.",
          "The practical decision is whether to buy a dedicated SLT unit or a combined SLT and YAG platform. A combined system treats both glaucoma and posterior capsule opacification from one device and one room, which suits a practice that does not already own a YAG. A dedicated SLT is a straightforward, lower-cost addition for a clinic that does.",
        ],
      },
      {
        heading: "What to check before buying",
        paragraphs: [],
        bullets: [
          "Energy calibration in every mode the unit offers, with a recent report.",
          "Aiming beam alignment and the condition of the slit-lamp optics.",
          "On combined systems, that both the SLT and YAG modes are working and calibrated, not just one.",
          "Included gonioscopy lenses, table and chin rest.",
          "Local service availability, since a glaucoma clinic cannot easily run without the laser.",
          WARRANTY_NOTE,
        ],
      },
    ],
  },
  {
    slug: "photocoagulation-lasers",
    summary:
      "Retinal photocoagulation lasers in green, yellow and infrared wavelengths, with slit-lamp, laser indirect ophthalmoscope and endoprobe delivery, for diabetic retinopathy, retinal tears and macular disease.",
    sections: [
      {
        heading: "Choosing a wavelength",
        paragraphs: [
          "Wavelength determines what a photocoagulator is good for. Green is the long-standing default for panretinal photocoagulation and retinal tear treatment. Yellow is absorbed well by oxyhaemoglobin and poorly by macular xanthophyll, which is why it is preferred close to the fovea. Infrared penetrates media opacity and sclera, making it the choice for transscleral work and for treating through a cloudy view.",
          "Many current platforms also offer a sub-threshold micropulse mode, which delivers energy in short bursts to treat without a visible burn. That capability is often licensed separately, so confirm it is active on the specific unit rather than assuming the platform implies it.",
        ],
      },
      {
        heading: "Delivery devices carry much of the value",
        paragraphs: [
          "The console is only part of the purchase. Slit-lamp adapters, the laser indirect ophthalmoscope, endoprobes and their fibres are expensive to buy separately and easy to omit from a resale. Establish exactly which are included and inspect every fibre for damage.",
        ],
        bullets: [
          "Output power calibration across the range, with a recent report.",
          "Which delivery devices are included, and the condition of each fibre.",
          "Whether micropulse or any sub-threshold mode is licensed on this unit.",
          "Aiming beam condition and the adjustable spot size and duration range.",
          WARRANTY_NOTE,
        ],
      },
    ],
  },
  {
    slug: "diagnostic-equipment",
    summary:
      "Optical coherence tomography, fundus imaging and wavefront diagnostic systems for retina, glaucoma, cornea and refractive surgery planning.",
    sections: [
      {
        heading: "Software licences decide what a diagnostic device is worth",
        paragraphs: [
          "On imaging systems the hardware is rarely the constraint. Analysis packages, angiography modes, normative databases and treatment-planning exports are licensed individually, and a unit missing the licence you need is worth far less to you than its condition suggests.",
          "This applies across the class: OCT angiography on a spectral-domain OCT, fluorescein angiography on a widefield fundus camera, and the export licence that lets a wavefront aberrometer or topographer send a treatment plan to a refractive laser. Ask which licences are active on the specific serial number and which transfer on sale.",
        ],
      },
      {
        heading: "Matching a diagnostic device to its laser",
        paragraphs: [
          "If the device will plan refractive treatments, compatibility is not a detail but the whole purchase. Confirm that its software version is accepted by the exact laser it will serve, and that the planning export is licensed. A perfectly functional aberrometer that cannot talk to your laser has no clinical use.",
        ],
      },
      {
        heading: "What to check before buying",
        paragraphs: [],
        bullets: [
          "Which analysis, angiography and export licences are active, by serial number.",
          "Software version, and whether the unit still receives updates.",
            "Condition of the scanning optics, and calibration status with a recent report.",
          "Whether the review workstation, monitor and table are included.",
          "How patient data migrates from your existing system, if you are replacing one.",
          WARRANTY_NOTE,
        ],
      },
    ],
  },
  {
    slug: "topographers",
    summary:
      "Corneal topography and tomography systems for refractive surgery screening, keratoconus detection and contact-lens fitting, including Placido-based and slit-scanning platforms.",
    sections: [
      {
        heading: "Topography and tomography are not the same thing",
        paragraphs: [
          "Placido-based topographers map the front surface of the cornea from reflected rings. They are fast, well proven and sufficient for contact-lens fitting and routine refractive screening. Slit-scanning and Scheimpflug tomographers additionally map the posterior surface and full-corneal thickness, which is what makes them useful for detecting early keratoconus and for post-refractive assessment.",
          "Which you need follows from the work. A practice screening refractive candidates and watching for ectasia wants posterior elevation data. A practice fitting lenses and checking astigmatism does not have to pay for it.",
        ],
      },
      {
        heading: "What to check before buying",
        paragraphs: [],
        bullets: [
          "Calibration status against the manufacturer's reference, with a recent report.",
          "Software version, the analysis modules licensed, and whether updates are still available.",
          "Whether the treatment-plan export to your refractive laser is licensed and version-compatible.",
          "Condition of the cone or scanning optics and the alignment mechanism.",
          "Whether the workstation, monitor and table are included.",
          WARRANTY_NOTE,
        ],
      },
    ],
  },
  {
    slug: "slit-lamps",
    summary:
      "Diagnostic slit lamps for anterior segment examination, contact-lens fitting and fundus examination with auxiliary lenses, with optional digital imaging.",
    sections: [
      {
        heading: "What separates a good slit lamp from an adequate one",
        paragraphs: [
          "Slit lamps are mechanically simple and long-lived, which makes them reliable pre-owned purchases. What varies is optical quality at the higher magnifications, the smoothness of the slit mechanism and the crispness of the beam edge, and the range of filters fitted.",
          "If the lamp will be used for documentation, the imaging path matters as much as the optics: check which camera and software it supports, whether that software still runs on a current operating system, and whether the beam splitter is included.",
        ],
      },
      {
        heading: "What to check before buying",
        paragraphs: [],
        bullets: [
          "Optics at every magnification step, checked for haze and fungus.",
          "Slit width, height and rotation mechanisms, moving smoothly through full travel.",
          "Illumination, filters and the condition of the bulb or LED module.",
          "Table, chin rest, joystick travel and locking.",
          "Any imaging accessories, and whether their software is still supported.",
          WARRANTY_NOTE,
        ],
      },
    ],
  },
  {
    slug: "microkeratomes",
    summary:
      "Mechanical microkeratomes for LASIK flap creation, with interchangeable heads, suction rings and disposable blades.",
    sections: [
      {
        heading: "Where a mechanical microkeratome still makes sense",
        paragraphs: [
          "Femtosecond lasers have taken most of the flap-creation market, but a mechanical microkeratome remains a legitimate and far cheaper route for a practice that does not perform enough refractive volume to justify a femtosecond platform, or that wants a backup when one is down.",
          "The trade-off is well understood: a microkeratome gives less control over flap thickness and geometry than a femtosecond laser, and its results depend more on technique and on blade quality. For straightforward cases in experienced hands it remains a proven method.",
        ],
      },
      {
        heading: "Consumable supply is the deciding question",
        paragraphs: [
          "Before buying any microkeratome, confirm that disposable blades and heads for that exact model are still manufactured and available to you. A microkeratome without a blade supply is scrap, and several models have outlived their consumables.",
        ],
        bullets: [
          "Blade and head availability for this specific model, confirmed with a supplier.",
          "Condition of the motor and drive unit, run through a full pass.",
          "Which heads and suction rings are included, and their condition.",
          "The control console, foot pedal and tubing.",
          WARRANTY_NOTE,
        ],
      },
    ],
  },
];

export function getCategoryContent(slug: string): CategoryContent | undefined {
  return CATEGORY_CONTENT.find((entry) => entry.slug === slug);
}
