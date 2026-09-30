// Lays out a specialty's equipment catalog as a PDF that doubles as marketing
// material: a cover, a page introducing the company and its services, then a
// three-column grid of photo, name, brand, category and short summary per
// product, each linking to its product page. Used by
// src/app/catalog/[file]/route.ts, which the printed QR codes point at.
//
// Deliberately left out, so a PDF that gets printed or forwarded can't go
// wrong: prices ("pricing on request" instead), indications and clinical
// claims (no health claims beyond the product page's labeling), and any
// watermark (photos are embedded as the plain originals).
import { PDFDocument, PDFFont, PDFImage, PDFName, PDFPage, PDFString, StandardFonts, rgb } from "pdf-lib";

export type CatalogPdfProduct = {
  name: string;
  brand: string | null;
  category: string;
  summary: string | null;
  url: string;
  /** JPEG bytes, already scaled down; null draws a placeholder. */
  photo: Uint8Array | null;
};

export type CatalogPdfIntro = {
  /** One line under the title on the cover. */
  tagline: string;
  /** What this catalog's specialty covers, for the "What we supply" section. */
  supply: { heading: string; body: string }[];
  /** Whether to include the trade-in offer (the business buys ophthalmic and surgical equipment only). */
  tradeIn: boolean;
  /**
   * Whether to claim a documented service history per unit. That fits
   * refurbished equipment, not new units such as the dental chairs.
   */
  serviceHistory: boolean;
  /** Whether to offer delivery, installation and training (ophthalmic equipment only, per the About page). */
  installation: boolean;
};

export type CatalogPdfInput = {
  title: string;
  intro: CatalogPdfIntro;
  products: CatalogPdfProduct[];
  logo: Uint8Array | null;
  contact: { phone: string; email: string; website: string; websiteUrl: string };
  generatedAt: Date;
};

// Same palette as the product digest email (src/lib/productDigest.ts).
const NAVY = rgb(0x0f / 255, 0x1b / 255, 0x33 / 255);
const GOLD = rgb(0xa8 / 255, 0x82 / 255, 0x3d / 255);
const CREAM = rgb(0xf8 / 255, 0xf6 / 255, 0xf1 / 255);
const BORDER = rgb(0xe6 / 255, 0xe1 / 255, 0xd6 / 255);
const TEXT = rgb(0x23 / 255, 0x28 / 255, 0x38 / 255);
const MUTED = rgb(0x5b / 255, 0x61 / 255, 0x72 / 255);

// US Letter, in points.
const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 36;
const COLUMNS = 3;
const GUTTER = 12;
const CARD_W = (PAGE_W - 2 * MARGIN - (COLUMNS - 1) * GUTTER) / COLUMNS;
const PHOTO_H = 100;
const CARD_H = 188;
const ROW_GAP = 10;
const FOOTER_H = 58;

const DISCLAIMER =
  "Brand names and trademarks belong to their respective owners and are used only to identify the equipment; " +
  "their use does not imply endorsement by or affiliation with the manufacturer. Availability and specifications " +
  "change; please confirm details, condition and pricing with us before ordering.";

// The company pages repeat what the About page (src/app/(shop)/about/page.tsx)
// already says, and nothing more: that page was cleared of unverifiable
// numbers and claims, so a printed brochure must not bring them back. Keep the
// two in step when either changes.
const ABOUT = [
  "MP MedPharma is a New Jersey based supplier of new and certified refurbished medical equipment. Since 2009 we have " +
    "worked with hospitals, eye clinics and surgery centers on the devices their lists depend on: phaco and vitrectomy " +
    "platforms, refractive, retina and glaucoma lasers, OCT and diagnostic imaging, slit lamps and surgical microscopes. " +
    "The catalogue now also serves dental practices, with integrated dental chair units.",
  "A good deal on capital equipment is not the lowest number on a quote. It is knowing what was serviced, what is " +
    "covered, who installs it and who answers when it stops working. That is the part we take seriously.",
];

// `requires` names the intro flag a claim depends on; claims without one apply to every catalog.
type Claim = { requires?: "serviceHistory" | "installation" };

const HIGHLIGHTS: ({ value: string; label: string } & Claim)[] = [
  { value: "Since 2009", label: "Serving hospitals & clinics" },
  { value: "Warranty", label: "On every unit we sell" },
  { value: "Documented", label: "Service history, per unit", requires: "serviceHistory" },
  { value: "Installed", label: "Delivery, setup and training", requires: "installation" },
];

const SERVICES: ({ heading: string; body: string } & Claim)[] = [
  {
    heading: "Every unit is inspected and documented",
    body: "Refurbished units ship with their service history, and we will tell you what was replaced and what was left alone.",
    requires: "serviceHistory",
  },
  {
    heading: "Warranty on new and refurbished alike",
    body: "Warranty coverage applies to every unit we supply, not only the new ones.",
  },
  {
    heading: "Delivered, installed and handed over",
    body: "For ophthalmic equipment we arrange white-glove delivery, installation and clinical training so the room is working before we leave it.",
    requires: "installation",
  },
  {
    heading: "Quoted per unit, not from a list",
    body: "Condition, configuration and included accessories differ on every device, so pricing is quoted against the actual unit and the room it is going into.",
  },
];

const TRADE_IN =
  "We buy pre-owned ophthalmic and surgical equipment and make transparent valuations, so the device you are " +
  "retiring can offset the one you are bringing in. Tell us what you have and we will tell you what it is worth.";

type Fonts = { regular: PDFFont; bold: PDFFont; serif: PDFFont };

/**
 * The standard PDF fonts only cover the WinAnsi character set, and drawing
 * anything outside it throws. Swap the usual offenders for plain equivalents
 * and drop whatever is left.
 */
function printable(text: string, font: PDFFont): string {
  const normalized = text
    .replace(/[‐-‒−]/g, "-")
    .replace(/[   ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  let out = "";
  for (const ch of normalized) {
    try {
      font.encodeText(ch);
      out += ch;
    } catch {
      // Not representable in WinAnsi.
    }
  }
  return out;
}

/** Word-wraps text to at most maxLines lines, ending the last with an ellipsis if it was cut. */
function wrap(text: string, font: PDFFont, size: number, width: number, maxLines: number): string[] {
  const words = text.split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";
  let i = 0;
  for (; i < words.length; i++) {
    const candidate = current ? `${current} ${words[i]}` : words[i];
    if (font.widthOfTextAtSize(candidate, size) <= width) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    if (lines.length === maxLines) break;
    // A single word wider than the line is cut to fit.
    current = words[i];
    while (font.widthOfTextAtSize(current, size) > width && current.length > 1) current = current.slice(0, -1);
  }
  if (lines.length < maxLines && current) {
    lines.push(current);
    i = words.length;
  }
  if (i < words.length && lines.length > 0) {
    let last = lines[lines.length - 1];
    while (last && font.widthOfTextAtSize(`${last}...`, size) > width) last = last.slice(0, -1).trimEnd();
    lines[lines.length - 1] = `${last}...`;
  }
  return lines;
}

function addLink(doc: PDFDocument, page: PDFPage, url: string, x: number, y: number, w: number, h: number) {
  const annotation = doc.context.register(
    doc.context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [x, y, x + w, y + h],
      Border: [0, 0, 0],
      A: { Type: "Action", S: "URI", URI: PDFString.of(url) },
    })
  );
  page.node.addAnnot(annotation);
}

function drawFooter(page: PDFPage, fonts: Fonts, input: CatalogPdfInput, pageNumber: number, pageCount: number) {
  const top = MARGIN + FOOTER_H - 8;
  page.drawLine({ start: { x: MARGIN, y: top }, end: { x: PAGE_W - MARGIN, y: top }, thickness: 0.75, color: BORDER });

  const contact = `${input.contact.phone}   |   ${input.contact.email}   |   ${input.contact.website}`;
  page.drawText(contact, { x: MARGIN, y: top - 14, size: 8.5, font: fonts.bold, color: NAVY });
  const pageLabel = `Page ${pageNumber} of ${pageCount}`;
  page.drawText(pageLabel, {
    x: PAGE_W - MARGIN - fonts.regular.widthOfTextAtSize(pageLabel, 8),
    y: top - 14,
    size: 8,
    font: fonts.regular,
    color: MUTED,
  });

  wrap(DISCLAIMER, fonts.regular, 6.5, PAGE_W - 2 * MARGIN, 3).forEach((line, i) => {
    page.drawText(line, { x: MARGIN, y: top - 27 - i * 8, size: 6.5, font: fonts.regular, color: MUTED });
  });
}

/** Draws text word-wrapped to width and returns the y below it. */
function paragraph(
  page: PDFPage,
  text: string,
  opts: { x: number; y: number; width: number; size: number; font: PDFFont; color: ReturnType<typeof rgb>; leading?: number; maxLines?: number }
): number {
  const leading = opts.leading ?? opts.size * 1.4;
  let y = opts.y;
  for (const line of wrap(printable(text, opts.font), opts.font, opts.size, opts.width, opts.maxLines ?? 100)) {
    page.drawText(line, { x: opts.x, y, size: opts.size, font: opts.font, color: opts.color });
    y -= leading;
  }
  return y;
}

/** Fits an image inside a box, centred, on a cream backdrop. */
function drawPhotoBox(page: PDFPage, photo: PDFImage, x: number, y: number, w: number, h: number, pad = 8) {
  page.drawRectangle({ x, y, width: w, height: h, color: CREAM, borderColor: BORDER, borderWidth: 0.75 });
  const scale = Math.min((w - 2 * pad) / photo.width, (h - 2 * pad) / photo.height);
  const pw = photo.width * scale;
  const ph = photo.height * scale;
  page.drawImage(photo, { x: x + (w - pw) / 2, y: y + (h - ph) / 2, width: pw, height: ph });
}

function drawLogo(page: PDFPage, fonts: Fonts, logo: PDFImage | null, x: number, top: number, h: number) {
  if (logo) {
    page.drawImage(logo, { x, y: top - h, width: (logo.width / logo.height) * h, height: h });
  } else {
    page.drawText("MP MedPharma", { x, y: top - h * 0.7, size: h * 0.55, font: fonts.serif, color: NAVY });
  }
}

/** Page 1: the brochure cover. */
function drawCoverPage(doc: PDFDocument, page: PDFPage, fonts: Fonts, input: CatalogPdfInput, logo: PDFImage | null, coverPhotos: PDFImage[]) {
  const inner = PAGE_W - 2 * MARGIN;
  let y = PAGE_H - MARGIN;
  drawLogo(page, fonts, logo, MARGIN, y, 44);

  const lines = [input.contact.phone, input.contact.email, input.contact.website];
  lines.forEach((line, i) => {
    const font = i === 2 ? fonts.bold : fonts.regular;
    const w = font.widthOfTextAtSize(line, 9.5);
    page.drawText(line, { x: PAGE_W - MARGIN - w, y: y - 11 - i * 14, size: 9.5, font, color: i === 2 ? GOLD : TEXT });
  });
  const siteW = fonts.bold.widthOfTextAtSize(input.contact.website, 9.5);
  addLink(doc, page, input.contact.websiteUrl, PAGE_W - MARGIN - siteW, y - 42, siteW, 13);

  // Title band.
  y -= 64;
  const bandH = 150;
  page.drawRectangle({ x: MARGIN, y: y - bandH, width: inner, height: bandH, color: NAVY });
  page.drawRectangle({ x: MARGIN, y: y - bandH, width: 5, height: bandH, color: GOLD });
  page.drawText("MP MEDPHARMA   |   SINCE 2009   |   NEW JERSEY, USA", { x: MARGIN + 28, y: y - 34, size: 8.5, font: fonts.bold, color: GOLD });
  page.drawText(printable(input.title, fonts.serif), { x: MARGIN + 28, y: y - 72, size: 30, font: fonts.serif, color: rgb(1, 1, 1) });
  paragraph(page, input.intro.tagline, {
    x: MARGIN + 28, y: y - 98, width: inner - 56, size: 12, font: fonts.regular, color: rgb(0.86, 0.88, 0.93), maxLines: 2,
  });
  const date = input.generatedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
  const count = `${input.products.length} ${input.products.length === 1 ? "item" : "items"} available`;
  page.drawText(`${count}   |   Updated ${date}`, { x: MARGIN + 28, y: y - bandH + 18, size: 8.5, font: fonts.regular, color: rgb(0.7, 0.74, 0.82) });

  // Photo showcase: one large photo and two stacked beside it, as tall as the
  // page allows below it for the highlights row and the call to action.
  y -= bandH + 14;
  const showH = y - (MARGIN + FOOTER_H + 12) - (18 + 54 + 46);
  if (coverPhotos.length >= 3) {
    const bigW = inner * 0.62;
    drawPhotoBox(page, coverPhotos[0], MARGIN, y - showH, bigW, showH, 14);
    const smallW = inner - bigW - 10;
    const smallH = (showH - 10) / 2;
    drawPhotoBox(page, coverPhotos[1], MARGIN + bigW + 10, y - smallH, smallW, smallH);
    drawPhotoBox(page, coverPhotos[2], MARGIN + bigW + 10, y - showH, smallW, smallH);
  } else if (coverPhotos.length > 0) {
    const w = (inner - 10 * (coverPhotos.length - 1)) / coverPhotos.length;
    coverPhotos.forEach((photo, i) => drawPhotoBox(page, photo, MARGIN + i * (w + 10), y - showH, w, showH, 14));
  }
  if (coverPhotos.length > 0) y -= showH + 18;

  // Highlights row.
  const highlights = HIGHLIGHTS.filter((item) => !item.requires || input.intro[item.requires]);
  const cellW = inner / highlights.length;
  highlights.forEach((item, i) => {
    const x = MARGIN + i * cellW;
    if (i > 0) page.drawLine({ start: { x, y: y - 2 }, end: { x, y: y - 36 }, thickness: 0.75, color: BORDER });
    const vw = fonts.serif.widthOfTextAtSize(item.value, 15);
    page.drawText(item.value, { x: x + (cellW - vw) / 2, y: y - 16, size: 15, font: fonts.serif, color: NAVY });
    const lw = fonts.regular.widthOfTextAtSize(item.label, 8);
    page.drawText(item.label, { x: x + (cellW - lw) / 2, y: y - 31, size: 8, font: fonts.regular, color: MUTED });
  });
  y -= 54;

  // Call to action.
  const ctaH = 46;
  page.drawRectangle({ x: MARGIN, y: y - ctaH, width: inner, height: ctaH, color: CREAM, borderColor: GOLD, borderWidth: 1 });
  page.drawText("Request a quote on any unit", { x: MARGIN + 18, y: y - 20, size: 12, font: fonts.bold, color: NAVY });
  page.drawText("Tap any item in this catalog to see it online, or call or email us.", { x: MARGIN + 18, y: y - 35, size: 8.5, font: fonts.regular, color: MUTED });
  const phone = input.contact.phone;
  const pw = fonts.bold.widthOfTextAtSize(phone, 14);
  page.drawText(phone, { x: PAGE_W - MARGIN - 18 - pw, y: y - 27, size: 14, font: fonts.bold, color: GOLD });
}

/** Page 2: who we are, what we supply and how we work. */
function drawAboutPage(page: PDFPage, fonts: Fonts, input: CatalogPdfInput) {
  const inner = PAGE_W - 2 * MARGIN;
  let y = drawRunningHeader(page, fonts, input);

  const kicker = (text: string) => {
    page.drawText(text, { x: MARGIN, y, size: 8.5, font: fonts.bold, color: GOLD });
    y -= 22;
  };
  const heading = (text: string, size = 19) => {
    page.drawText(text, { x: MARGIN, y, size, font: fonts.serif, color: NAVY });
    y -= size + 6;
  };

  kicker("WHO WE ARE");
  heading("Capital equipment, bought the way clinicians would want to buy it");
  for (const text of ABOUT) {
    y = paragraph(page, text, { x: MARGIN, y, width: inner, size: 10, font: fonts.regular, color: TEXT }) - 6;
  }

  y -= 8;
  kicker("WHAT WE SUPPLY");
  for (const item of input.intro.supply) {
    page.drawRectangle({ x: MARGIN, y: y - 3, width: 3, height: 12, color: GOLD });
    page.drawText(printable(item.heading, fonts.bold), { x: MARGIN + 12, y, size: 10.5, font: fonts.bold, color: NAVY });
    y -= 15;
    y = paragraph(page, item.body, { x: MARGIN + 12, y, width: inner - 12, size: 9.5, font: fonts.regular, color: TEXT }) - 8;
  }

  y -= 6;
  kicker("HOW WE WORK");
  const colW = (inner - 18) / 2;
  const services = SERVICES.filter((service) => !service.requires || input.intro[service.requires]);
  for (let row = 0; row < services.length; row += 2) {
    const ends = services.slice(row, row + 2).map((service, col) => {
      const x = MARGIN + col * (colW + 18);
      page.drawText(service.heading, { x, y, size: 10.5, font: fonts.bold, color: NAVY });
      return paragraph(page, service.body, { x, y: y - 15, width: colW, size: 9, font: fonts.regular, color: TEXT });
    });
    y = Math.min(...ends) - 10;
  }

  if (input.intro.tradeIn) {
    const boxTop = y;
    const text = wrap(printable(TRADE_IN, fonts.regular), fonts.regular, 9, inner - 32, 6);
    const boxH = 36 + text.length * 12.6;
    page.drawRectangle({ x: MARGIN, y: boxTop - boxH, width: inner, height: boxH, color: CREAM, borderColor: BORDER, borderWidth: 0.75 });
    page.drawText("Replacing equipment?", { x: MARGIN + 16, y: boxTop - 20, size: 11, font: fonts.bold, color: NAVY });
    text.forEach((line, i) => page.drawText(line, { x: MARGIN + 16, y: boxTop - 36 - i * 12.6, size: 9, font: fonts.regular, color: TEXT }));
    y = boxTop - boxH - 16;
  }

  // Closing call to action, pinned above the footer.
  const ctaH = 64;
  const ctaY = MARGIN + FOOTER_H + 10;
  page.drawRectangle({ x: MARGIN, y: ctaY, width: inner, height: ctaH, color: NAVY });
  page.drawText("Talk to us about your next unit", { x: MARGIN + 18, y: ctaY + ctaH - 24, size: 13, font: fonts.serif, color: rgb(1, 1, 1) });
  page.drawText("We quote against the actual unit and the room it is going into.", {
    x: MARGIN + 18, y: ctaY + 16, size: 8.5, font: fonts.regular, color: rgb(0.78, 0.81, 0.88),
  });
  const contactLines = [input.contact.phone, input.contact.email, input.contact.website];
  contactLines.forEach((line, i) => {
    const w = fonts.bold.widthOfTextAtSize(line, 9.5);
    page.drawText(line, { x: PAGE_W - MARGIN - 18 - w, y: ctaY + ctaH - 20 - i * 14, size: 9.5, font: fonts.bold, color: i === 0 ? GOLD : rgb(1, 1, 1) });
  });
}

function drawRunningHeader(page: PDFPage, fonts: Fonts, input: CatalogPdfInput): number {
  const y = PAGE_H - MARGIN - 10;
  page.drawText(`MP MedPharma  |  ${input.title}`, { x: MARGIN, y, size: 9, font: fonts.bold, color: NAVY });
  page.drawRectangle({ x: MARGIN, y: y - 8, width: PAGE_W - 2 * MARGIN, height: 1, color: GOLD });
  return y - 22;
}

function drawCard(
  doc: PDFDocument,
  page: PDFPage,
  fonts: Fonts,
  product: CatalogPdfProduct,
  photo: PDFImage | null,
  x: number,
  top: number
) {
  const bottom = top - CARD_H;
  page.drawRectangle({ x, y: bottom, width: CARD_W, height: CARD_H, borderColor: BORDER, borderWidth: 0.75 });

  const photoBottom = top - PHOTO_H;
  page.drawRectangle({ x: x + 0.5, y: photoBottom, width: CARD_W - 1, height: PHOTO_H - 0.5, color: CREAM });
  if (photo) {
    const pad = 6;
    const scale = Math.min((CARD_W - 2 * pad) / photo.width, (PHOTO_H - 2 * pad) / photo.height);
    const w = photo.width * scale;
    const h = photo.height * scale;
    page.drawImage(photo, { x: x + (CARD_W - w) / 2, y: photoBottom + (PHOTO_H - h) / 2, width: w, height: h });
  } else {
    const label = "Photo on website";
    page.drawText(label, {
      x: x + (CARD_W - fonts.regular.widthOfTextAtSize(label, 8)) / 2,
      y: photoBottom + PHOTO_H / 2 - 3,
      size: 8,
      font: fonts.regular,
      color: MUTED,
    });
  }

  const inner = CARD_W - 16;
  let y = photoBottom - 16;
  for (const line of wrap(printable(product.name, fonts.bold), fonts.bold, 10, inner, 2)) {
    page.drawText(line, { x: x + 8, y, size: 10, font: fonts.bold, color: NAVY });
    y -= 12.5;
  }

  const meta = [product.brand, product.category].filter(Boolean).join("  |  ");
  y -= 1;
  for (const line of wrap(printable(meta, fonts.regular), fonts.regular, 7.5, inner, 1)) {
    page.drawText(line, { x: x + 8, y, size: 7.5, font: fonts.regular, color: GOLD });
    y -= 12;
  }

  // As many summary lines as fit above the pricing row, which a two-line name
  // leaves less room for.
  const summaryLines = Math.max(0, Math.floor((y - (bottom + 22)) / 9.5) + 1);
  if (product.summary && summaryLines > 0) {
    for (const line of wrap(printable(product.summary, fonts.regular), fonts.regular, 7.5, inner, summaryLines)) {
      page.drawText(line, { x: x + 8, y, size: 7.5, font: fonts.regular, color: TEXT });
      y -= 9.5;
    }
  }

  const cta = "Details & quote >";
  page.drawText("Pricing on request", { x: x + 8, y: bottom + 9, size: 7.5, font: fonts.regular, color: MUTED });
  const ctaW = fonts.bold.widthOfTextAtSize(cta, 7.5);
  page.drawText(cta, { x: x + CARD_W - 8 - ctaW, y: bottom + 9, size: 7.5, font: fonts.bold, color: GOLD });

  // The whole card is the link, so a tap anywhere on it opens the product page.
  addLink(doc, page, product.url, x, bottom, CARD_W, CARD_H);
}

export async function buildCatalogPdf(input: CatalogPdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`MP MedPharma - ${input.title}`);
  doc.setAuthor("MP MedPharma");
  doc.setSubject(input.title);
  doc.setCreator(input.contact.website);
  doc.setLanguage("en-US");
  doc.setCreationDate(input.generatedAt);
  doc.setModificationDate(input.generatedAt);

  const fonts: Fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    serif: await doc.embedFont(StandardFonts.TimesRomanBold),
  };

  let logo: PDFImage | null = null;
  if (input.logo) {
    try {
      logo = await doc.embedPng(input.logo);
    } catch {
      logo = null;
    }
  }

  const photos = await Promise.all(
    input.products.map(async (product) => {
      if (!product.photo) return null;
      try {
        return await doc.embedJpg(product.photo);
      } catch {
        return null;
      }
    })
  );

  // The cover shows the first three products that have a photo, from
  // different categories where the catalog has them.
  const coverPhotos: PDFImage[] = [];
  const coverCategories = new Set<string>();
  for (const pass of [0, 1]) {
    input.products.forEach((product, i) => {
      const photo = photos[i];
      if (!photo || coverPhotos.length >= 3 || coverPhotos.includes(photo)) return;
      if (pass === 0 && coverCategories.has(product.category)) return;
      coverPhotos.push(photo);
      coverCategories.add(product.category);
    });
  }

  const pages: PDFPage[] = [];
  const newPage = () => {
    const created = doc.addPage([PAGE_W, PAGE_H]);
    pages.push(created);
    return created;
  };

  drawCoverPage(doc, newPage(), fonts, input, logo, coverPhotos);
  drawAboutPage(newPage(), fonts, input);

  let page = newPage();
  let top = drawRunningHeader(page, fonts, input);
  page.drawText("Available equipment", { x: MARGIN, y: top - 4, size: 19, font: fonts.serif, color: NAVY });
  page.drawText("Pricing on request. Tap any item to see full details and request a quote online.", {
    x: MARGIN, y: top - 20, size: 9, font: fonts.regular, color: MUTED,
  });
  top -= 36;
  let column = 0;

  if (input.products.length === 0) {
    page.drawText("No equipment is listed in this category right now.", { x: MARGIN, y: top - 10, size: 11, font: fonts.bold, color: NAVY });
    page.drawText("Call or email us: new stock arrives regularly and we can source specific models.", {
      x: MARGIN,
      y: top - 28,
      size: 9.5,
      font: fonts.regular,
      color: MUTED,
    });
  }

  input.products.forEach((product, i) => {
    if (column === 0 && top - CARD_H < MARGIN + FOOTER_H) {
      page = newPage();
      top = drawRunningHeader(page, fonts, input);
    }
    drawCard(doc, page, fonts, product, photos[i], MARGIN + column * (CARD_W + GUTTER), top);
    column += 1;
    if (column === COLUMNS) {
      column = 0;
      top -= CARD_H + ROW_GAP;
    }
  });

  pages.forEach((p, i) => drawFooter(p, fonts, input, i + 1, pages.length));

  // Show the pages as one continuous scroll, which reads best on a phone.
  doc.catalog.set(PDFName.of("PageLayout"), PDFName.of("OneColumn"));

  return doc.save();
}
