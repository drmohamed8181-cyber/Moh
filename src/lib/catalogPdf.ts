// Lays out a specialty's equipment catalog as a PDF: a three-column grid of
// photo, name, brand, category and short summary per product, each linking to
// its product page. Used by src/app/catalog/[file]/route.ts, which the printed
// QR codes point at.
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

export type CatalogPdfInput = {
  title: string;
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
const CARD_H = 200;
const ROW_GAP = 12;
const FOOTER_H = 58;

const DISCLAIMER =
  "Brand names and trademarks belong to their respective owners and are used only to identify the equipment; " +
  "their use does not imply endorsement by or affiliation with the manufacturer. Availability and specifications " +
  "change; please confirm details, condition and pricing with us before ordering.";

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

/** The first page's header; returns the y the grid starts below. */
function drawCover(doc: PDFDocument, page: PDFPage, fonts: Fonts, input: CatalogPdfInput, logo: PDFImage | null): number {
  let y = PAGE_H - MARGIN;
  if (logo) {
    const h = 40;
    const w = (logo.width / logo.height) * h;
    page.drawImage(logo, { x: MARGIN, y: y - h, width: w, height: h });
  } else {
    page.drawText("MP MedPharma", { x: MARGIN, y: y - 28, size: 22, font: fonts.serif, color: NAVY });
  }

  const lines = [input.contact.phone, input.contact.email, input.contact.website];
  lines.forEach((line, i) => {
    const font = i === 2 ? fonts.bold : fonts.regular;
    const w = font.widthOfTextAtSize(line, 9);
    page.drawText(line, { x: PAGE_W - MARGIN - w, y: y - 10 - i * 13, size: 9, font, color: i === 2 ? GOLD : TEXT });
  });
  const siteW = fonts.bold.widthOfTextAtSize(input.contact.website, 9);
  addLink(doc, page, input.contact.websiteUrl, PAGE_W - MARGIN - siteW, y - 39, siteW, 12);

  y -= 56;
  page.drawRectangle({ x: MARGIN, y, width: PAGE_W - 2 * MARGIN, height: 2, color: GOLD });

  y -= 32;
  page.drawText(input.title, { x: MARGIN, y, size: 24, font: fonts.serif, color: NAVY });
  y -= 18;
  const date = input.generatedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
  const count = `${input.products.length} ${input.products.length === 1 ? "item" : "items"} available`;
  page.drawText(`${count}   |   Updated ${date}   |   Pricing on request`, { x: MARGIN, y, size: 9.5, font: fonts.regular, color: MUTED });
  y -= 13;
  page.drawText("Tap any item to see full details and request a quote online.", { x: MARGIN, y, size: 9.5, font: fonts.regular, color: MUTED });
  return y - 18;
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

  const pages: PDFPage[] = [];
  let page = doc.addPage([PAGE_W, PAGE_H]);
  pages.push(page);
  let top = drawCover(doc, page, fonts, input, logo);
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
      page = doc.addPage([PAGE_W, PAGE_H]);
      pages.push(page);
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
