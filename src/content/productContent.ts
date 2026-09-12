// Editorial content for the catalogue.
//
// Why a file and not the admin form: the admin form is one product at a time,
// and most product pages were shipping with "No description available." A
// page with no text of its own cannot rank for the model name buyers search,
// however good its title is. This file is the whole catalogue's copy in one
// place, matched to products by model keywords so it survives renames.
//
// It reaches the public pages two ways, and needs neither to be set up:
//
//   1. Automatically, as a fallback. withEditorialContent() below fills any
//      field the database leaves empty, so deploying this file is enough for
//      every product page to have text. Anything typed in the admin wins.
//   2. Optionally, written into the database by `npm run content:apply`
//      (scripts/apply-product-content.ts), which makes the text editable in
//      the admin. Running it changes nothing a visitor sees.
//
// Rules for the copy: describe the device class, what it is used for and what
// a buyer should check; state only widely documented facts; keep exact
// specifications to the few that are certain, and leave the rest to the
// per-unit specification table the admin fills in.

export type ProductContent = {
  /**
   * Every keyword must appear in the product name after normalising both to
   * lowercase alphanumerics ("IQ 810" and "IQ-810" both become "iq810").
   * The first entry that matches wins, so list specific models before
   * families ("stellaris elite" before "stellaris").
   */
  match: string[];
  description: string;
  features?: string[];
  indications?: string[];
  specifications?: Record<string, string>;
};

const OFFER =
  "Available from MP MedPharma as a new or certified refurbished unit with documented service history and warranty coverage. Pricing is quoted per unit according to configuration, included accessories and condition; a private demo can be arranged before purchase.";

export const PRODUCT_CONTENT: ProductContent[] = [
  // ---------------------------------------------------------------- Alcon
  {
    match: ["centurion"],
    description: `The Alcon Centurion Vision System is a phacoemulsification platform for cataract surgery and the successor to the Infiniti. Its defining feature is Active Fluidics, which regulates intraocular pressure to a surgeon-set target rather than relying on bottle height, giving a more stable anterior chamber and less post-occlusion surge at higher vacuum settings. It uses torsional ultrasound through the OZil handpiece with balanced tip designs, and is operated from a touch-screen console with a wireless footpedal and remote.\n\nBuyers should confirm the included handpieces and tips, the software version, and the fluidic cassette supply, since these make up a meaningful share of the value of any unit. ${OFFER}`,
    features: [
      "Active Fluidics intraocular pressure control",
      "OZil torsional ultrasound with balanced tips",
      "Touch-screen console with wireless footpedal",
      "Surgeon-programmable settings for each procedure step",
    ],
    indications: ["Phacoemulsification cataract surgery", "Anterior segment irrigation and aspiration", "Anterior vitrectomy"],
  },
  {
    match: ["infiniti"],
    description: `The Alcon Infiniti Vision System is a proven phacoemulsification platform that introduced OZil torsional ultrasound and remained in service in operating rooms worldwide for well over a decade. It uses gravity-fed irrigation with bottle-height control, supports longitudinal and torsional ultrasound, and offers a broad ecosystem of handpieces, tips and consumables that keep it economical to run.\n\nFor practices with a routine cataract case mix the Infiniti remains a dependable, lower-cost entry into torsional phaco. Confirm the included handpieces, footpedal and the software version when comparing units. ${OFFER}`,
    features: ["OZil torsional and longitudinal ultrasound", "Gravity-fed fluidics with programmable bottle height", "Wide availability of handpieces and consumables", "Programmable surgeon settings"],
    indications: ["Phacoemulsification cataract surgery", "Irrigation and aspiration", "Anterior vitrectomy"],
  },
  {
    match: ["constellation"],
    description: `The Alcon Constellation Vision System is a combined vitreoretinal and anterior segment surgical platform. It integrates high-speed vitrectomy with duty-cycle control, intraocular pressure compensation, an integrated laser option and phacoemulsification in one console, so retina and cataract procedures can be performed on the same system.\n\nWhen buying a pre-owned Constellation, check which modules are fitted (laser, phaco, illumination), the vitrectomy probe gauges supported by the installed software, and the service history of the console and light sources. ${OFFER}`,
    features: ["High-speed vitrectomy with duty-cycle control", "Intraocular pressure compensation", "Integrated phaco and optional laser module", "Xenon illumination"],
    indications: ["Pars plana vitrectomy", "Retinal detachment and macular surgery", "Combined phaco-vitrectomy procedures"],
  },
  {
    match: ["luxor"],
    description: `The Alcon LuxOR LX3 is an ophthalmic surgical microscope designed for cataract and anterior segment surgery. Its illumination system is built to give a wide, stable red reflex that stays visible with eye movement and decentration, which surgeons value during capsulorhexis and cortex removal. It is offered on floor stands with motorised focus, zoom and XY positioning and can be fitted with assistant scopes and video documentation.\n\nOn a pre-owned microscope check the optics for haze or delamination, the stand's motorised movements, the light source hours and any video or recording equipment included. ${OFFER}`,
    features: ["Wide, stable red reflex illumination", "Motorised focus, zoom and XY", "Floor stand with counterbalanced arm", "Options for assistant scope and video"],
    indications: ["Cataract surgery", "Anterior segment surgery", "Corneal and glaucoma procedures"],
  },
  {
    match: ["ex500"],
    description: `The Alcon WaveLight EX500 is an excimer laser for refractive surgery, operating at a 500 Hz pulse rate with eye tracking and a range of treatment profiles including wavefront-optimised and topography-guided ablations. It is normally used together with WaveLight diagnostic devices such as the Topolyzer VARIO and can be paired with a WaveLight femtosecond laser for a complete LASIK suite.\n\nA used excimer laser should be assessed on its shot count, optics and gas service history, the treatment licences that transfer with it, and the room conditions it requires; see our guide on buying a used excimer laser. ${OFFER}`,
    features: ["500 Hz excimer ablation", "Eye tracking with cyclotorsion compensation options", "Wavefront-optimised and topography-guided treatments", "Integration with WaveLight diagnostics"],
    indications: ["LASIK", "PRK and surface ablation", "Topography-guided refractive treatments"],
    specifications: { "Laser type": "Excimer (ArF), 193 nm", "Pulse rate": "500 Hz" },
  },
  {
    match: ["wavelight", "400"],
    description: `The Alcon WaveLight 400 Hz excimer laser is the predecessor to the EX500 and remains a capable refractive platform for LASIK and surface ablation, with eye tracking and wavefront-optimised treatment profiles. Its lower pulse rate means slightly longer ablation times than the EX500, while its consumables and service infrastructure are well established.\n\nBuyers should verify the shot count, optics and gas service dates, and which treatment licences are active on the unit. ${OFFER}`,
    features: ["400 Hz excimer ablation", "Active eye tracking", "Wavefront-optimised treatment profiles"],
    indications: ["LASIK", "PRK and surface ablation"],
    specifications: { "Laser type": "Excimer (ArF), 193 nm", "Pulse rate": "400 Hz" },
  },
  {
    match: ["topolyzer"],
    description: `The Alcon WaveLight Topolyzer VARIO is a corneal topographer and pupillometer used to plan refractive treatments on WaveLight excimer lasers. It captures corneal curvature, keratometry and pupil data and exports treatment plans for topography-guided ablation, and it is also used for corneal screening and contact-lens fitting.\n\nConfirm that the software version is compatible with the laser it will be paired with, and that the export licence is included. ${OFFER}`,
    features: ["Placido-based corneal topography", "Pupillometry under different lighting conditions", "Export of topography-guided treatment plans to WaveLight lasers"],
    indications: ["Refractive surgery planning", "Keratoconus and corneal screening", "Contact-lens fitting"],
  },
  {
    match: ["laserex"],
    description: `The Alcon Laserex 3000LX (3000LE) is a compact Nd:YAG ophthalmic laser for posterior capsulotomy and peripheral iridotomy. It is a straightforward, reliable slit-lamp-mounted YAG that many practices use as their primary or backup capsulotomy laser.\n\nOn a used YAG, check the energy calibration, the aiming beam and the slit-lamp optics, and confirm the included table and safety filters. ${OFFER}`,
    features: ["Nd:YAG photodisruption", "Slit-lamp delivery with aiming beam", "Compact footprint"],
    indications: ["Posterior capsulotomy", "Peripheral iridotomy"],
    specifications: { "Laser type": "Nd:YAG, 1064 nm" },
  },
  // ---------------------------------------------------------------- Zeiss
  {
    match: ["cirrus", "5000"],
    description: `The Zeiss Cirrus HD-OCT 5000 is a spectral-domain optical coherence tomography system for retina, glaucoma and anterior segment imaging. It scans at 68,000 A-scans per second, includes FastTrac retinal tracking, and supports AngioPlex OCT angiography on suitably licensed units, giving non-invasive visualisation of retinal and choroidal vasculature. Its analysis library covers macular thickness, RNFL and ganglion cell analysis with normative databases, and progression tracking over time.\n\nWhen comparing units, confirm which software licences are active (in particular AngioPlex), the software version, and whether the review station and table are included. ${OFFER}`,
    features: ["68 kHz spectral-domain OCT", "FastTrac retinal tracking", "AngioPlex OCT angiography (licence-dependent)", "Macular, RNFL and ganglion cell analyses with normative data", "Anterior segment imaging"],
    indications: ["Retinal disease diagnosis and monitoring", "Glaucoma assessment and progression analysis", "Anterior segment and angle imaging", "OCT angiography of retinal and choroidal vasculature"],
    specifications: { "Scan speed": "68,000 A-scans/s", "Technology": "Spectral-domain OCT" },
  },
  {
    match: ["cirrus", "4000"],
    description: `The Zeiss Cirrus HD-OCT 4000 is a spectral-domain OCT that established the Cirrus platform in retina and glaucoma clinics. It provides macular cube and RNFL scans with the same normative-database analyses used on later Cirrus models, and is a cost-effective choice for practices that need reliable structural OCT without OCT angiography.\n\nCheck the software version, the condition of the scanning optics and the included computer, and whether the unit has been upgraded with retinal tracking. ${OFFER}`,
    features: ["Spectral-domain OCT imaging", "Macular cube and optic disc cube scans", "RNFL and ganglion cell analyses with normative data", "Guided progression analysis"],
    indications: ["Macular disease diagnosis and monitoring", "Glaucoma assessment", "Structural retinal imaging"],
    specifications: { "Technology": "Spectral-domain OCT" },
  },
  {
    match: ["clarus", "700"],
    description: `The Zeiss Clarus 700 is an ultra-widefield fundus imaging system that captures true-colour images across a 200-degree field of view in a single capture, with fluorescein angiography in addition to the colour, autofluorescence and infrared modes of the Clarus 500. It is used in retina, diabetic eye disease and general screening workflows where peripheral pathology matters.\n\nConfirm the imaging modes licensed on the unit, the software version and the condition of the optics and the review workstation. ${OFFER}`,
    features: ["Ultra-widefield true-colour imaging", "Fluorescein angiography", "Fundus autofluorescence and infrared imaging", "Montage imaging beyond 200 degrees"],
    indications: ["Diabetic retinopathy screening and monitoring", "Retinal detachment and peripheral retinal disease", "Age-related macular degeneration", "Fluorescein angiography"],
  },
  {
    match: ["clarus", "500"],
    description: `The Zeiss Clarus 500 is an ultra-widefield fundus camera that produces true-colour images across a 200-degree field in a single capture, together with fundus autofluorescence and infrared modes. It suits retina, diabetic eye disease and screening clinics that want widefield coverage with natural colour rendering.\n\nOn a pre-owned unit, check the optics, the imaging modes licensed, and the included workstation and table. ${OFFER}`,
    features: ["Ultra-widefield true-colour imaging", "Fundus autofluorescence", "Infrared imaging", "Montage imaging"],
    indications: ["Diabetic retinopathy screening", "Peripheral retinal disease", "Macular disease documentation"],
  },
  {
    match: ["visante"],
    description: `The Zeiss Visante OCT is an anterior segment optical coherence tomography system operating at 1310 nm, a wavelength chosen for imaging the cornea, anterior chamber angle and lens through opaque or pigmented tissue. It is used for corneal pachymetry maps, angle assessment in glaucoma, and planning for refractive and phakic-lens procedures.\n\nCheck the software version, the condition of the scanning unit and the included computer, and confirm the calibration status. ${OFFER}`,
    features: ["1310 nm anterior segment OCT", "Corneal pachymetry mapping", "Anterior chamber angle and depth measurement", "Phakic IOL and refractive surgery planning"],
    indications: ["Anterior chamber angle assessment", "Corneal thickness mapping", "Refractive and phakic-lens surgery planning", "Post-operative flap and graft assessment"],
    specifications: { Wavelength: "1310 nm", Technology: "Time-domain anterior segment OCT" },
  },
  {
    match: ["visu", "160"],
    description: `The Zeiss OPMI VISU 160 is an ophthalmic surgical microscope widely used for cataract and anterior segment surgery. It offers apochromatic optics, coaxial illumination for a good red reflex, motorised focus and zoom, and a floor stand with XY positioning; assistant scopes and video adapters are available.\n\nAssess the optics for haze, the stand's motorised functions and the illumination hours. ${OFFER}`,
    features: ["Zeiss apochromatic optics", "Coaxial illumination for red reflex", "Motorised focus and zoom", "Floor stand with XY coupling"],
    indications: ["Cataract surgery", "Anterior segment surgery"],
  },
  // ---------------------------------------------------------------- Ellex
  {
    match: ["tango"],
    description: `The Ellex Tango is a combined SLT and YAG ophthalmic laser: a 532 nm frequency-doubled laser for selective laser trabeculoplasty and a 1064 nm Nd:YAG for posterior capsulotomy and iridotomy in one slit-lamp-mounted system. Reflex versions add Ellex's Reflex technology for the YAG mode. It lets a practice offer glaucoma laser treatment and capsulotomy from a single device and a single room.\n\nOn a pre-owned Tango check the energy calibration in both modes, the aiming beam alignment, the slit-lamp optics and the included table. ${OFFER}`,
    features: ["SLT and YAG in one platform", "Slit-lamp delivery with aiming beam", "Selectable energy for capsulotomy and iridotomy"],
    indications: ["Selective laser trabeculoplasty for open-angle glaucoma", "Posterior capsulotomy", "Peripheral iridotomy"],
    specifications: { "SLT wavelength": "532 nm", "YAG wavelength": "1064 nm" },
  },
  {
    match: ["solo"],
    description: `The Ellex Solo is a dedicated SLT laser for selective laser trabeculoplasty in open-angle glaucoma. It delivers 532 nm pulses through a slit-lamp with a fixed SLT spot, and its simplicity makes it a straightforward addition to a glaucoma clinic that already has a YAG laser.\n\nCheck energy calibration, aiming beam alignment and the slit-lamp optics on any used unit. ${OFFER}`,
    features: ["Dedicated SLT laser", "Slit-lamp delivery", "Simple operation for high-volume SLT"],
    indications: ["Selective laser trabeculoplasty for open-angle glaucoma and ocular hypertension"],
    specifications: { Wavelength: "532 nm" },
  },
  {
    match: ["ultraq"],
    description: `The Ellex Ultra Q is an Nd:YAG ophthalmic laser for posterior capsulotomy and peripheral iridotomy. Reflex versions include Ellex's Reflex technology, which switches between slit-lamp illumination and laser optical paths to improve visualisation of the capsule and reduce the energy required. It is a compact, widely serviced YAG suitable as a primary capsulotomy laser.\n\nVerify energy calibration, aiming beam alignment and slit-lamp optics, and confirm the included table and filters. ${OFFER}`,
    features: ["Nd:YAG photodisruption", "Reflex technology on Reflex models", "Slit-lamp delivery with aiming beam"],
    indications: ["Posterior capsulotomy", "Peripheral iridotomy"],
    specifications: { "Laser type": "Nd:YAG, 1064 nm" },
  },
  {
    match: ["superq"],
    description: `The Ellex Super Q is an Nd:YAG ophthalmic laser for posterior capsulotomy and peripheral iridotomy, delivered through an integrated slit-lamp with a coaxial aiming beam. It is a proven, economical YAG that many practices run as their everyday capsulotomy laser.\n\nCheck energy calibration, aiming beam and slit-lamp optics, and confirm the table and safety filter are included. ${OFFER}`,
    features: ["Nd:YAG photodisruption", "Integrated slit-lamp delivery", "Compact design"],
    indications: ["Posterior capsulotomy", "Peripheral iridotomy"],
    specifications: { "Laser type": "Nd:YAG, 1064 nm" },
  },
  {
    match: ["solitaire"],
    description: `The Ellex Solitaire is a 532 nm green photocoagulator for retina and glaucoma treatment, delivered through a slit-lamp and optionally a laser indirect ophthalmoscope. It is used for panretinal and focal photocoagulation, retinal tear repair and laser trabeculoplasty, and its solid-state design keeps it compact and low-maintenance.\n\nOn a used photocoagulator, check the output power calibration, the delivery devices included (slit-lamp adapter, indirect ophthalmoscope, endoprobe) and the fibre condition. ${OFFER}`,
    features: ["532 nm solid-state photocoagulation", "Slit-lamp and laser indirect ophthalmoscope delivery options", "Adjustable spot size and duration"],
    indications: ["Panretinal photocoagulation for diabetic retinopathy", "Focal and grid macular laser", "Retinal tear and detachment prophylaxis", "Laser trabeculoplasty"],
    specifications: { Wavelength: "532 nm" },
  },
  {
    match: ["integre"],
    description: `The Ellex Integre is a slit-lamp-integrated retinal photocoagulator combining the laser and the slit-lamp in one compact unit. It is used for panretinal and focal photocoagulation and for laser trabeculoplasty, and its integrated design suits clinics with limited space or those equipping a dedicated laser room. Model variants differ in the wavelengths fitted.\n\nConfirm the wavelength configuration of the specific unit, the power calibration and the delivery accessories included. ${OFFER}`,
    features: ["Integrated slit-lamp and laser", "Adjustable spot size and duration", "Compact footprint"],
    indications: ["Panretinal photocoagulation", "Focal and grid macular laser", "Laser trabeculoplasty"],
  },
  // ---------------------------------------------------------------- Iridex
  {
    match: ["iq577"],
    description: `The Iridex IQ 577 is a 577 nm yellow photocoagulation laser for retina and glaucoma. Yellow light is well absorbed by oxyhaemoglobin and weakly by xanthophyll, which suits treatment close to the fovea, and the platform supports MicroPulse mode for sub-threshold treatment of diabetic macular oedema and central serous chorioretinopathy. Delivery options include slit-lamp adapters, a laser indirect ophthalmoscope and endoprobes.\n\nCheck power calibration, MicroPulse licence, the delivery devices included and the fibre condition. ${OFFER}`,
    features: ["577 nm yellow wavelength", "MicroPulse sub-threshold mode", "Slit-lamp, indirect ophthalmoscope and endoprobe delivery"],
    indications: ["Diabetic macular oedema (conventional and MicroPulse)", "Panretinal photocoagulation", "Central serous chorioretinopathy", "Laser trabeculoplasty"],
    specifications: { Wavelength: "577 nm" },
  },
  {
    match: ["iq532"],
    description: `The Iridex IQ 532 is a 532 nm green photocoagulation laser for retina and glaucoma, with MicroPulse capability on suitably licensed units. Green is the standard wavelength for panretinal photocoagulation and retinal tear treatment, and the IQ platform's delivery options cover slit-lamp, laser indirect ophthalmoscope and endoprobe use.\n\nVerify power calibration, the MicroPulse licence, the delivery devices included and the fibre condition. ${OFFER}`,
    features: ["532 nm green wavelength", "MicroPulse mode (licence-dependent)", "Multiple delivery options"],
    indications: ["Panretinal photocoagulation", "Retinal tear and detachment prophylaxis", "Focal and grid macular laser", "Laser trabeculoplasty"],
    specifications: { Wavelength: "532 nm" },
  },
  {
    match: ["iq810"],
    description: `The Iridex IQ 810 is an 810 nm infrared diode laser used across retina, glaucoma and paediatric ophthalmology. Infrared penetrates media opacities and the sclera, which allows transscleral cyclophotocoagulation for glaucoma, retinopathy of prematurity treatment through the indirect ophthalmoscope, and MicroPulse retinal treatment on licensed units.\n\nCheck the power calibration, the MicroPulse licence, and the delivery devices such as the G-Probe, indirect ophthalmoscope and slit-lamp adapter. ${OFFER}`,
    features: ["810 nm infrared diode laser", "MicroPulse mode (licence-dependent)", "Transscleral and endoscopic delivery options"],
    indications: ["Transscleral cyclophotocoagulation for glaucoma", "Retinopathy of prematurity", "Retinal photocoagulation through media opacity", "MicroPulse retinal treatment"],
    specifications: { Wavelength: "810 nm" },
  },
  {
    match: ["cyclog6"],
    description: `The Iridex Cyclo G6 is an 810 nm glaucoma laser system designed for transscleral cyclophotocoagulation using the MicroPulse P3 probe, with the G-Probe available for continuous-wave treatment. MicroPulse transscleral laser therapy offers a repeatable, non-incisional option for lowering intraocular pressure in a wide range of glaucoma patients.\n\nConfirm the probes and licences included with the unit and check power calibration. ${OFFER}`,
    features: ["810 nm laser dedicated to glaucoma", "MicroPulse P3 and G-Probe delivery", "Compact console"],
    indications: ["MicroPulse transscleral laser therapy for glaucoma", "Continuous-wave transscleral cyclophotocoagulation"],
    specifications: { Wavelength: "810 nm" },
  },
  // ---------------------------------------------------------------- Lumenis
  {
    match: ["selecta", "duet"],
    description: `The Lumenis Selecta Duet is a combined SLT and YAG laser system, pairing a 532 nm selective laser trabeculoplasty mode with a 1064 nm Nd:YAG for capsulotomy and iridotomy in one slit-lamp-mounted platform. It lets a practice treat open-angle glaucoma and posterior capsule opacification with a single device.\n\nOn a pre-owned unit check energy calibration in both modes, aiming beam alignment and the slit-lamp optics. ${OFFER}`,
    features: ["SLT and YAG in one system", "Slit-lamp delivery", "Selectable energy and spot for each mode"],
    indications: ["Selective laser trabeculoplasty", "Posterior capsulotomy", "Peripheral iridotomy"],
    specifications: { "SLT wavelength": "532 nm", "YAG wavelength": "1064 nm" },
  },
  {
    match: ["selecta"],
    description: `The Lumenis Selecta II is the SLT laser on which selective laser trabeculoplasty was established as a first-line treatment for open-angle glaucoma. It delivers 532 nm, Q-switched pulses through a slit-lamp with a fixed SLT spot and remains a widely serviced, dependable glaucoma laser.\n\nCheck energy calibration, aiming beam alignment and slit-lamp optics before purchase. ${OFFER}`,
    features: ["Dedicated SLT laser", "Slit-lamp delivery with fixed spot", "Well-established service base"],
    indications: ["Selective laser trabeculoplasty for open-angle glaucoma and ocular hypertension"],
    specifications: { Wavelength: "532 nm" },
  },
  // ---------------------------------------------------------------- Johnson & Johnson Vision / AMO
  {
    match: ["idesign"],
    description: `The Johnson & Johnson Vision iDesign is a wavefront aberrometer and diagnostic station used to plan wavefront-guided LASIK on the VISX STAR S4 IR excimer laser. It measures higher-order aberrations, corneal topography, keratometry, pupillometry and autorefraction in one capture and exports the treatment plan to the laser.\n\nConfirm the software version is compatible with the laser it will serve and that the export licence transfers. ${OFFER}`,
    features: ["High-resolution wavefront aberrometry", "Corneal topography and keratometry", "Pupillometry and autorefraction", "Wavefront-guided treatment export to VISX lasers"],
    indications: ["Wavefront-guided LASIK planning", "Refractive surgery screening"],
  },
  {
    match: ["visx"],
    description: `The AMO VISX STAR S4 IR is an excimer laser for LASIK and surface ablation with variable spot scanning, active eye tracking and iris registration to compensate for cyclotorsion between the diagnostic capture and treatment. Paired with the WaveScan or iDesign aberrometer it delivers wavefront-guided treatments, and it has one of the largest installed bases of any refractive laser.\n\nAs with any used excimer, assess shot count, optics and gas service history, active treatment licences and room requirements; see our used excimer laser checklist. ${OFFER}`,
    features: ["Variable spot scanning excimer", "Iris registration and active eye tracking", "Wavefront-guided treatment with WaveScan or iDesign"],
    indications: ["LASIK", "PRK and surface ablation", "Wavefront-guided refractive treatment"],
    specifications: { "Laser type": "Excimer (ArF), 193 nm" },
  },
  {
    match: ["intralase"],
    description: `The Johnson & Johnson Vision IntraLase iFS is a 150 kHz femtosecond laser for creating LASIK flaps, with options for corneal tunnels, lamellar and penetrating keratoplasty cuts. Femtosecond flap creation offers predictable flap thickness and geometry compared with a mechanical microkeratome.\n\nBuyers should verify the laser source service history, the software version and licensed procedures, the patient-interface consumable supply and the room requirements. ${OFFER}`,
    features: ["150 kHz femtosecond laser", "Programmable flap geometry", "Corneal tunnel and keratoplasty modes (licence-dependent)"],
    indications: ["LASIK flap creation", "Intracorneal ring segment tunnels", "Lamellar and penetrating keratoplasty cuts"],
    specifications: { "Repetition rate": "150 kHz", "Laser type": "Femtosecond" },
  },
  {
    match: ["whitestar"],
    description: `The Johnson & Johnson Vision WhiteStar Signature phacoemulsification system supports both peristaltic and venturi fluidics, letting the surgeon switch between them within a case, and uses WhiteStar micropulse ultrasound with Ellips transversal motion to improve followability and reduce thermal load. It is used across cataract case mixes, from routine to dense nuclei.\n\nConfirm the included handpieces, the fluidics modules fitted and the software version when comparing units. ${OFFER}`,
    features: ["Dual peristaltic and venturi fluidics", "WhiteStar micropulse ultrasound", "Ellips transversal ultrasound"],
    indications: ["Phacoemulsification cataract surgery", "Irrigation and aspiration", "Anterior vitrectomy"],
  },
  {
    match: ["intuitiv"],
    description: `The Johnson & Johnson Vision Compact Intuitiv is a compact phacoemulsification system built for smaller operating rooms and mobile or satellite surgical services. It offers programmable peristaltic fluidics and WhiteStar-based ultrasound in a small console.\n\nCheck the handpieces and footpedal included and the software version. ${OFFER}`,
    features: ["Compact console", "Programmable peristaltic fluidics", "WhiteStar ultrasound"],
    indications: ["Phacoemulsification cataract surgery", "Irrigation and aspiration"],
  },
  // ---------------------------------------------------------------- Bausch + Lomb
  {
    match: ["stellaris", "elite"],
    description: `The Bausch + Lomb Stellaris Elite is a combined phacoemulsification and vitreoretinal surgical platform, with Vitesse hypersonic vitrectomy on suitably equipped units alongside conventional high-speed pneumatic vitrectomy, dual-linear control and adaptive fluidics. It allows anterior and posterior segment surgery on one console.\n\nConfirm the modules fitted (posterior, laser, illumination), the vitrectomy technologies licensed and the included handpieces. ${OFFER}`,
    features: ["Combined phaco and vitreoretinal platform", "High-speed vitrectomy", "Dual-linear footpedal control", "Adaptive fluidics"],
    indications: ["Phacoemulsification cataract surgery", "Pars plana vitrectomy", "Combined anterior and posterior procedures"],
  },
  {
    match: ["stellaris", "pc"],
    description: `The Bausch + Lomb Stellaris PC is a combined phaco and vitrectomy platform for anterior and posterior segment surgery, offering high-speed vitrectomy, xenon illumination, dual-linear control and the option of an integrated laser. It suits surgical centres that want one console for cataract and retina lists.\n\nConfirm which modules are fitted and licensed, and check the illumination source hours and included handpieces. ${OFFER}`,
    features: ["Combined phaco and vitrectomy", "High-speed vitrectomy cutter support", "Xenon illumination", "Optional integrated laser"],
    indications: ["Phacoemulsification cataract surgery", "Pars plana vitrectomy", "Combined procedures"],
  },
  {
    match: ["stellaris"],
    description: `The Bausch + Lomb Stellaris Vision Enhancement System is a phacoemulsification platform for micro-incision cataract surgery, offering both vacuum and flow-based fluidics, dual-linear footpedal control and a compact console. It is a widely serviced platform suitable for high-volume cataract lists.\n\nConfirm the included handpieces, the fluidics configuration and the software version. ${OFFER}`,
    features: ["Vacuum and flow fluidics options", "Dual-linear footpedal control", "Micro-incision capable"],
    indications: ["Phacoemulsification cataract surgery", "Irrigation and aspiration", "Anterior vitrectomy"],
  },
  {
    match: ["zyoptix"],
    description: `The Bausch + Lomb Zyoptix XP is a mechanical microkeratome for LASIK flap creation, used with disposable heads and blades. Mechanical microkeratomes remain a cost-effective flap-creation option for practices without a femtosecond laser.\n\nCheck the motor and drive unit condition, the heads and rings included, and the availability of consumable blades for the model. ${OFFER}`,
    features: ["Mechanical LASIK flap creation", "Interchangeable heads for flap thickness", "Disposable blade system"],
    indications: ["LASIK flap creation"],
  },
  {
    match: ["hansatome"],
    description: `The Bausch + Lomb Hansatome is a widely used mechanical microkeratome for LASIK flap creation with a superior hinge, operated with disposable blades and interchangeable heads and suction rings. It has one of the largest installed bases of any microkeratome.\n\nAssess the motor, the console, the suction rings and heads included, and confirm blade availability. ${OFFER}`,
    features: ["Superior-hinge flap creation", "Interchangeable heads and suction rings", "Disposable blades"],
    indications: ["LASIK flap creation"],
  },
  {
    match: ["orbscan"],
    description: `The Bausch + Lomb Orbscan IIz combines slit-scanning corneal tomography with Placido topography to map the anterior and posterior corneal surfaces, corneal thickness and anterior chamber depth. It is used for refractive surgery screening, keratoconus detection and corneal disease follow-up.\n\nVerify calibration, the software version and the included workstation. ${OFFER}`,
    features: ["Anterior and posterior corneal elevation maps", "Full-corneal pachymetry", "Placido topography", "Anterior chamber depth measurement"],
    indications: ["Refractive surgery screening", "Keratoconus detection and monitoring", "Corneal disease follow-up"],
  },
  // ---------------------------------------------------------------- Others
  {
    match: ["femtoldv"],
    description: `The Ziemer FEMTO LDV Z6 is a mobile femtosecond laser for LASIK flap creation and corneal procedures, using a low-energy, high-repetition-rate approach and a compact, movable design that can serve more than one operating room. Depending on model and licences it supports lamellar keratoplasty, tunnels and other corneal cuts.\n\nConfirm the licensed applications, the laser source service history, the patient-interface consumable supply and room requirements. ${OFFER}`,
    features: ["Mobile femtosecond laser", "Low-energy, high-frequency pulses", "Programmable flap and corneal cuts (licence-dependent)"],
    indications: ["LASIK flap creation", "Corneal tunnels and lamellar cuts"],
    specifications: { "Laser type": "Femtosecond" },
  },
  {
    match: ["endooptiks"],
    description: `The Endo Optiks E2 is a laser and endoscopy system used for endoscopic cyclophotocoagulation (ECP) in glaucoma, combining an 810 nm diode laser, an endoscope with illumination and a video system so the ciliary processes can be viewed and treated directly. It is used most often in combination with cataract surgery.\n\nCheck the laser calibration, the endoscope probes and light source included, and the video system condition. ${OFFER}`,
    features: ["Endoscopic view of the ciliary processes", "810 nm diode laser", "Integrated video and illumination"],
    indications: ["Endoscopic cyclophotocoagulation for glaucoma", "Combined ECP and cataract surgery"],
    specifications: { Wavelength: "810 nm" },
  },
  {
    match: ["cso", "900"],
    description: `The CSO SL 900 series is a diagnostic slit lamp from the Italian manufacturer CSO, offering high-quality optics, a range of magnifications and a slit and filter set for routine anterior segment examination. It can be fitted with a digital camera and imaging software for documentation.\n\nOn a used slit lamp, check the optics, the slit mechanism and illumination, the table and chin rest, and any imaging accessories included. ${OFFER}`,
    features: ["Multiple magnification steps", "Full slit and filter set", "Optional digital imaging"],
    indications: ["Anterior segment examination", "Contact-lens fitting", "Fundus examination with auxiliary lenses"],
  },
];

const normalise = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * The entry whose every keyword appears in `name`, or undefined. Both sides are
 * reduced to lowercase alphanumerics first, so "IQ 810" matches "IQ-810".
 */
export function findProductContent(name: string): ProductContent | undefined {
  const key = normalise(name);
  return PRODUCT_CONTENT.find((entry) => entry.match.every((keyword) => key.includes(normalise(keyword))));
}

type Fillable = {
  name: string;
  description?: string | null;
  features?: string[];
  indications?: string[];
  specifications?: unknown;
};

/**
 * Fills empty editorial fields from PRODUCT_CONTENT, leaving anything the admin
 * has written untouched. Specification rows are merged, with the database's own
 * rows taking precedence over the generic ones here: a per-unit serial number
 * or configuration must never be overwritten by a model-level default.
 */
export function withEditorialContent<T extends Fillable>(product: T): T {
  const content = findProductContent(product.name);
  if (!content) return product;

  const specifications = product.specifications as Record<string, string> | null | undefined;
  const hasSpecifications = specifications != null && Object.keys(specifications).length > 0;

  return {
    ...product,
    description: product.description?.trim() ? product.description : content.description,
    features: product.features && product.features.length > 0 ? product.features : content.features ?? [],
    indications: product.indications && product.indications.length > 0 ? product.indications : content.indications ?? [],
    specifications: content.specifications
      ? { ...content.specifications, ...(hasSpecifications ? specifications : {}) }
      : product.specifications,
  };
}
