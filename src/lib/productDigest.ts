import { escapeHtml, formatDate, buildInquiryHref } from "@/lib/utils";

export type DigestProduct = {
  name: string;
  slug: string;
  sku: string;
  category: string | null;
  manufacturer: string | null;
  shortDescription: string | null;
  features: string[];
  images: string[];
  isAvailable: boolean;
  stock: number;
  isFeatured: boolean;
  specifications: Record<string, string> | null;
};

type BuildDigestInput = {
  newProducts: DigestProduct[];
  updatedProducts: DigestProduct[];
  baseUrl: string;
  unsubscribeUrl: string;
  issueDate: Date;
};

type BuiltDigest = {
  subject: string;
  previewText: string;
  html: string;
  text: string;
};

const COLORS = {
  navy: "#0F1B33",
  navyLight: "#16264A",
  gold: "#C7A45C",
  goldDark: "#A8823D",
  cream: "#F8F6F1",
  border: "#E6E1D6",
  text: "#232838",
  textMuted: "#5B6172",
  white: "#FFFFFF",
};

const FONT_SERIF = "Georgia, 'Times New Roman', Times, serif";
const FONT_SANS = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const CONTACT = {
  name: "MP MedPharma",
  phone: "929-349-8569",
  phoneHref: "tel:9293498569",
  email: "dr.mohamed8181@gmail.com",
  address: "New York, NY 10001, USA",
};

const MAX_NEW = 6;
const MAX_UPDATED = 6;

function resolveImage(baseUrl: string, image: string | undefined): string {
  if (!image) return "";
  return image.startsWith("http") ? image : `${baseUrl}${image}`;
}

function equipmentFormat(p: DigestProduct): string {
  const spec = p.specifications || {};
  return (
    spec["Equipment Type"] ||
    spec["System Type"] ||
    spec["Laser Type"] ||
    spec["Style"] ||
    p.category ||
    "Ophthalmic Equipment"
  );
}

function availabilityLabel(p: DigestProduct): { label: string; dotColor: string } {
  if (!p.isAvailable || p.stock <= 0) return { label: "Currently Unavailable", dotColor: "#9CA3AF" };
  if (p.stock === 1) return { label: "1 Unit Available", dotColor: "#3F8F5F" };
  return { label: `${p.stock} Units Available`, dotColor: "#3F8F5F" };
}

function productUrl(baseUrl: string, p: DigestProduct): string {
  return `${baseUrl}/products/${p.slug}`;
}

function inquiryUrl(baseUrl: string, p: DigestProduct): string {
  return `${baseUrl}${buildInquiryHref({ name: p.name, slug: p.slug, sku: p.sku, category: p.category })}`;
}

function altText(p: DigestProduct): string {
  return `${p.name} — ${p.category || "ophthalmic equipment"}, product photo`;
}

function goldButton(label: string, href: string, opts?: { block?: boolean }): string {
  const width = opts?.block ? "width:100%;" : "";
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="${width}">
      <tr>
        <td align="center" bgcolor="${COLORS.gold}" style="border-radius:4px;">
          <a href="${href}" target="_blank"
            style="display:inline-block;${width}padding:13px 28px;font-family:${FONT_SANS};font-size:13px;
            letter-spacing:0.8px;font-weight:600;color:${COLORS.navy};text-decoration:none;text-transform:uppercase;
            border-radius:4px;box-sizing:border-box;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>`;
}

function outlineButton(label: string, href: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="border:1px solid ${COLORS.border};border-radius:4px;">
          <a href="${href}" target="_blank"
            style="display:inline-block;padding:12px 26px;font-family:${FONT_SANS};font-size:13px;
            letter-spacing:0.6px;font-weight:600;color:${COLORS.navy};text-decoration:none;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>`;
}

function sectionLabel(text: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;">
      <tr>
        <td style="font-family:${FONT_SANS};font-size:12px;letter-spacing:2.5px;font-weight:700;color:${COLORS.goldDark};text-transform:uppercase;">
          ${escapeHtml(text)}
        </td>
        <td style="border-top:1px solid ${COLORS.border};line-height:1px;font-size:1px;">&nbsp;</td>
      </tr>
    </table>`;
}

function productCard(baseUrl: string, p: DigestProduct, badge?: string): string {
  const image = resolveImage(baseUrl, p.images[0]);
  const avail = availabilityLabel(p);
  const featuresHtml = p.features
    .slice(0, 3)
    .map(
      (f) => `
        <tr>
          <td style="padding:2px 0;font-family:${FONT_SANS};font-size:13px;color:${COLORS.textMuted};vertical-align:top;width:16px;">
            <span style="color:${COLORS.gold};">&#10003;</span>
          </td>
          <td style="padding:2px 0 2px 6px;font-family:${FONT_SANS};font-size:13px;line-height:19px;color:${COLORS.textMuted};">
            ${escapeHtml(f)}
          </td>
        </tr>`
    )
    .join("");

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="border:1px solid ${COLORS.border};border-radius:6px;margin-bottom:18px;">
    <tr>
      <td style="padding:0;">
        ${
          image
            ? `<a href="${productUrl(baseUrl, p)}" target="_blank" style="display:block;">
                <img src="${image}" alt="${escapeHtml(altText(p))}" width="600"
                  style="width:100%;max-width:600px;height:auto;display:block;border-radius:6px 6px 0 0;">
              </a>`
            : ""
        }
      </td>
    </tr>
    <tr>
      <td style="padding:22px 24px 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              ${
                badge
                  ? `<span style="display:inline-block;font-family:${FONT_SANS};font-size:10px;letter-spacing:1.2px;
                      font-weight:700;color:${COLORS.white};background:${COLORS.navy};text-transform:uppercase;
                      padding:4px 9px;border-radius:3px;margin-bottom:10px;">${escapeHtml(badge)}</span><br/>`
                  : ""
              }
              <span style="font-family:${FONT_SANS};font-size:11px;letter-spacing:1.2px;font-weight:600;
                color:${COLORS.goldDark};text-transform:uppercase;">${escapeHtml(p.category || "Equipment")}</span>
              <div style="font-family:${FONT_SERIF};font-size:20px;font-weight:700;color:${COLORS.navy};
                margin:6px 0 10px;line-height:26px;">
                <a href="${productUrl(baseUrl, p)}" target="_blank" style="color:${COLORS.navy};text-decoration:none;">
                  ${escapeHtml(p.name)}
                </a>
              </div>
              <p style="font-family:${FONT_SANS};font-size:14px;line-height:21px;color:${COLORS.textMuted};margin:0 0 14px;">
                ${escapeHtml(p.shortDescription || "")}
              </p>
              ${featuresHtml ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">${featuresHtml}</table>` : ""}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;">
                <tr>
                  <td style="font-family:${FONT_SANS};font-size:12px;color:${COLORS.textMuted};padding-right:16px;">
                    <strong style="color:${COLORS.text};">Format:</strong> ${escapeHtml(equipmentFormat(p))}
                  </td>
                  <td style="font-family:${FONT_SANS};font-size:12px;color:${COLORS.textMuted};">
                    <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${avail.dotColor};margin-right:5px;"></span>
                    ${escapeHtml(avail.label)}
                  </td>
                </tr>
              </table>
              ${outlineButton("View Product", productUrl(baseUrl, p))}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function updateRow(baseUrl: string, p: DigestProduct, note: string): string {
  const image = resolveImage(baseUrl, p.images[0]);
  return `
  <tr>
    <td style="padding:16px 0;border-bottom:1px solid ${COLORS.border};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${
            image
              ? `<td width="72" style="vertical-align:top;">
                  <a href="${productUrl(baseUrl, p)}" target="_blank">
                    <img src="${image}" alt="${escapeHtml(altText(p))}" width="64" height="64"
                      style="width:64px;height:64px;object-fit:cover;border-radius:5px;display:block;">
                  </a>
                </td>`
              : ""
          }
          <td style="vertical-align:top;padding-left:${image ? "16px" : "0"};">
            <span style="display:inline-block;font-family:${FONT_SANS};font-size:10px;letter-spacing:1px;
              font-weight:700;color:${COLORS.goldDark};text-transform:uppercase;margin-bottom:4px;">${escapeHtml(note)}</span>
            <div style="font-family:${FONT_SERIF};font-size:16px;font-weight:700;color:${COLORS.navy};margin-bottom:3px;">
              <a href="${productUrl(baseUrl, p)}" target="_blank" style="color:${COLORS.navy};text-decoration:none;">
                ${escapeHtml(p.name)}
              </a>
            </div>
            <div style="font-family:${FONT_SANS};font-size:13px;color:${COLORS.textMuted};">
              ${escapeHtml(availabilityLabel(p).label)} &nbsp;&middot;&nbsp;
              <a href="${productUrl(baseUrl, p)}" target="_blank" style="color:${COLORS.goldDark};text-decoration:none;font-weight:600;">See details &rarr;</a>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function featuredSection(baseUrl: string, p: DigestProduct): string {
  const image = resolveImage(baseUrl, p.images[0]);
  const highlights = p.features
    .slice(0, 3)
    .map(
      (f) => `
        <tr>
          <td style="padding:5px 0;font-family:${FONT_SANS};font-size:14px;color:${COLORS.white};vertical-align:top;width:20px;">
            <span style="color:${COLORS.gold};">&#10003;</span>
          </td>
          <td style="padding:5px 0 5px 8px;font-family:${FONT_SANS};font-size:14px;line-height:21px;color:#D7DBE6;">
            ${escapeHtml(f)}
          </td>
        </tr>`
    )
    .join("");

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background:${COLORS.navy};border-radius:8px;overflow:hidden;margin-bottom:8px;">
    ${
      image
        ? `<tr>
            <td>
              <img src="${image}" alt="${escapeHtml(altText(p))}" width="600"
                style="width:100%;max-width:600px;height:auto;display:block;">
            </td>
          </tr>`
        : ""
    }
    <tr>
      <td style="padding:32px 32px 36px;">
        <span style="display:inline-block;font-family:${FONT_SANS};font-size:11px;letter-spacing:2px;font-weight:700;
          color:${COLORS.gold};text-transform:uppercase;margin-bottom:12px;">Featured This Fortnight</span>
        <div style="font-family:${FONT_SERIF};font-size:26px;font-weight:700;color:${COLORS.white};line-height:32px;margin-bottom:12px;">
          ${escapeHtml(p.name)}
        </div>
        <p style="font-family:${FONT_SANS};font-size:15px;line-height:23px;color:#D7DBE6;margin:0 0 20px;">
          ${escapeHtml(p.shortDescription || "")}
        </p>
        ${highlights ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;">${highlights}</table>` : ""}
        ${goldButton("Inquire Now", inquiryUrl(baseUrl, p))}
      </td>
    </tr>
  </table>`;
}

export function buildProductDigestEmail(input: BuildDigestInput): BuiltDigest {
  const { baseUrl, unsubscribeUrl, issueDate } = input;

  const combined = [...input.newProducts, ...input.updatedProducts];
  const featured =
    combined.find((p) => p.isFeatured) || input.newProducts[0] || input.updatedProducts[0] || null;

  const newProducts = input.newProducts.filter((p) => p !== featured).slice(0, MAX_NEW);
  const updatedProducts = input.updatedProducts.filter((p) => p !== featured).slice(0, MAX_UPDATED);

  const issueDateStr = formatDate(issueDate);
  const newCount = newProducts.length + (featured && input.newProducts.includes(featured) ? 1 : 0);

  const subject =
    newCount > 0
      ? `New Arrivals at MP MedPharma — ${issueDateStr}`
      : `Product Updates from MP MedPharma — ${issueDateStr}`;

  const previewText =
    "New arrivals, recent updates, and this fortnight's featured system inside — take a look.";

  const newCardsHtml = newProducts.map((p) => productCard(baseUrl, p, "New Arrival")).join("");

  const updateRowsHtml = updatedProducts
    .map((p) => updateRow(baseUrl, p, "Recently Updated"))
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>MP MedPharma Product Update</title>
<!--[if mso]>
<style type="text/css">
  table { border-collapse: collapse; }
  .fallback-font { font-family: Georgia, 'Times New Roman', serif !important; }
</style>
<![endif]-->
<style>
  @media only screen and (max-width: 620px) {
    .container { width: 100% !important; }
    .stack { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
    .px { padding-left: 20px !important; padding-right: 20px !important; }
    .h1 { font-size: 24px !important; line-height: 30px !important; }
  }
  a.btn:hover { opacity: 0.88; }
</style>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.cream};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${COLORS.cream};">
    ${escapeHtml(previewText)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLORS.cream};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" class="container" width="640" cellpadding="0" cellspacing="0" border="0" style="width:640px;max-width:640px;">

          <!-- Header -->
          <tr>
            <td class="px" style="background:${COLORS.navy};border-radius:8px 8px 0 0;padding:40px 40px 34px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="width:44px;height:44px;background:${COLORS.gold};border-radius:50%;text-align:center;vertical-align:middle;">
                    <span style="font-family:${FONT_SERIF};font-size:17px;font-weight:700;color:${COLORS.navy};line-height:44px;">MP</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;text-align:left;">
                    <span style="font-family:${FONT_SANS};font-size:14px;letter-spacing:2px;font-weight:700;color:${COLORS.white};text-transform:uppercase;">MedPharma</span>
                  </td>
                </tr>
              </table>
              <div class="h1" style="font-family:${FONT_SERIF};font-size:28px;line-height:34px;font-weight:700;color:${COLORS.white};margin-bottom:8px;">
                Product Update
              </div>
              <div style="font-family:${FONT_SANS};font-size:13px;letter-spacing:0.5px;color:${COLORS.gold};margin-bottom:16px;">
                Discover what&rsquo;s new this fortnight
              </div>
              <span style="display:inline-block;font-family:${FONT_SANS};font-size:11px;letter-spacing:1px;color:#AEB6C9;
                border:1px solid #2C3B5C;border-radius:20px;padding:6px 16px;">
                Issue Date: ${escapeHtml(issueDateStr)}
              </span>
            </td>
          </tr>

          <!-- Opening message -->
          <tr>
            <td class="px" style="background:${COLORS.white};padding:36px 40px 8px;">
              <p style="font-family:${FONT_SERIF};font-size:17px;line-height:27px;color:${COLORS.text};margin:0 0 16px;">
                Dear Valued Customer,
              </p>
              <p style="font-family:${FONT_SANS};font-size:14px;line-height:23px;color:${COLORS.textMuted};margin:0 0 4px;">
                Welcome to your biweekly MP MedPharma product update. Every two weeks we bring you a curated look at the
                latest additions and changes to our inventory of precision-inspected, manufacturer-tested ophthalmic
                and surgical equipment &mdash; so your practice always has visibility into what&rsquo;s available.
                Here&rsquo;s what&rsquo;s new since our last issue.
              </p>
            </td>
          </tr>

          <!-- New products -->
          ${
            newCardsHtml
              ? `<tr>
                  <td class="px" style="background:${COLORS.white};padding:28px 40px 4px;">
                    ${sectionLabel("New Products")}
                    ${newCardsHtml}
                  </td>
                </tr>`
              : ""
          }

          <!-- Product updates -->
          ${
            updateRowsHtml
              ? `<tr>
                  <td class="px" style="background:${COLORS.white};padding:12px 40px 8px;">
                    ${sectionLabel("Product Updates")}
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      ${updateRowsHtml}
                    </table>
                  </td>
                </tr>`
              : ""
          }

          <!-- Featured product -->
          ${
            featured
              ? `<tr>
                  <td class="px" style="background:${COLORS.white};padding:28px 40px 4px;">
                    ${sectionLabel("Spotlight")}
                    ${featuredSection(baseUrl, featured)}
                  </td>
                </tr>`
              : ""
          }

          <!-- Customer CTA -->
          <tr>
            <td class="px" style="background:${COLORS.white};padding:36px 40px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:${COLORS.cream};border-radius:8px;">
                <tr>
                  <td style="padding:32px 32px;text-align:center;">
                    <div style="font-family:${FONT_SERIF};font-size:20px;font-weight:700;color:${COLORS.navy};margin-bottom:10px;">
                      We&rsquo;re Here to Help
                    </div>
                    <p style="font-family:${FONT_SANS};font-size:14px;line-height:21px;color:${COLORS.textMuted};margin:0 0 22px;">
                      Explore the full catalog, request a quotation, or speak directly with a product specialist
                      about your practice&rsquo;s equipment needs.
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                      <tr>
                        <td style="padding:0 6px 10px;">${goldButton("Browse All Products", `${baseUrl}/products`)}</td>
                      </tr>
                      <tr>
                        <td style="padding:0 6px;">
                          ${outlineButton(
                            "Request a Quotation",
                            `${baseUrl}/contact?${new URLSearchParams({
                              subject: "Quotation Request",
                              message: "I'd like to request a quotation for equipment featured in your latest product update.",
                            }).toString()}`
                          )}
                        </td>
                      </tr>
                    </table>
                    <p style="font-family:${FONT_SANS};font-size:13px;color:${COLORS.textMuted};margin:18px 0 0;">
                      Prefer to talk? Call <a href="${CONTACT.phoneHref}" style="color:${COLORS.goldDark};font-weight:600;text-decoration:none;">${CONTACT.phone}</a>
                      to speak with a specialist.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="px" style="background:${COLORS.navy};border-radius:0 0 8px 8px;padding:36px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align:center;padding-bottom:18px;">
                    <span style="font-family:${FONT_SERIF};font-size:16px;font-weight:700;color:${COLORS.white};">MP MedPharma</span>
                  </td>
                </tr>
                <tr>
                  <td style="text-align:center;font-family:${FONT_SANS};font-size:12px;line-height:20px;color:#AEB6C9;padding-bottom:18px;">
                    ${escapeHtml(CONTACT.address)}<br>
                    <a href="${CONTACT.phoneHref}" style="color:#AEB6C9;text-decoration:none;">${escapeHtml(CONTACT.phone)}</a>
                    &nbsp;&middot;&nbsp;
                    <a href="mailto:${CONTACT.email}" style="color:#AEB6C9;text-decoration:none;">${escapeHtml(CONTACT.email)}</a>
                    &nbsp;&middot;&nbsp;
                    <a href="${baseUrl}" style="color:#AEB6C9;text-decoration:none;">${baseUrl.replace(/^https?:\/\//, "")}</a>
                  </td>
                </tr>
                <tr>
                  <td style="text-align:center;padding-bottom:20px;">
                    ${["Facebook", "Instagram", "LinkedIn"]
                      .map(
                        (n) => `
                      <a href="${baseUrl}" style="display:inline-block;width:28px;height:28px;border-radius:50%;
                        background:#1C2C4E;color:${COLORS.gold};font-family:${FONT_SANS};font-size:10px;font-weight:700;
                        text-align:center;line-height:28px;text-decoration:none;margin:0 4px;">
                        ${n.charAt(0)}
                      </a>`
                      )
                      .join("")}
                  </td>
                </tr>
                <tr>
                  <td style="text-align:center;font-family:${FONT_SANS};font-size:11px;line-height:18px;color:#8590A8;padding-bottom:14px;">
                    <a href="${unsubscribeUrl}" style="color:#8590A8;text-decoration:underline;">Unsubscribe</a>
                    &nbsp;&middot;&nbsp;
                    <a href="${baseUrl}/privacy" style="color:#8590A8;text-decoration:underline;">Privacy Policy</a>
                    &nbsp;&middot;&nbsp;
                    <a href="${baseUrl}/terms" style="color:#8590A8;text-decoration:underline;">Terms</a>
                  </td>
                </tr>
                <tr>
                  <td style="text-align:center;font-family:${FONT_SANS};font-size:10px;line-height:16px;color:#6B7593;border-top:1px solid #22335A;padding-top:14px;">
                    &copy; ${issueDate.getFullYear()} MP MedPharma. All rights reserved.<br>
                    Equipment shown may be pre-owned and refurbished; condition, configuration, and availability are
                    confirmed at time of inquiry. Product images are representative and may not depict the exact unit
                    or configuration available. This communication is provided for informational purposes only, does
                    not constitute medical, clinical, or regulatory advice, and is not a binding offer of sale.
                    Specifications are subject to change without notice.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textLines: string[] = [];
  textLines.push("MP MEDPHARMA — PRODUCT UPDATE");
  textLines.push("Discover what's new this fortnight");
  textLines.push(`Issue Date: ${issueDateStr}`);
  textLines.push("");
  textLines.push("Dear Valued Customer,");
  textLines.push("");
  textLines.push(
    "Welcome to your biweekly MP MedPharma product update. Every two weeks we bring you a curated look at the latest additions and changes to our inventory of precision-inspected, manufacturer-tested ophthalmic and surgical equipment. Here's what's new since our last issue."
  );
  textLines.push("");

  const allNew = featured && input.newProducts.includes(featured) ? [featured, ...newProducts] : newProducts;
  if (allNew.length) {
    textLines.push("NEW PRODUCTS");
    textLines.push("------------");
    for (const p of allNew) {
      textLines.push(`* ${p.name} (${p.category || "Equipment"})`);
      if (p.shortDescription) textLines.push(`  ${p.shortDescription}`);
      textLines.push(`  Format: ${equipmentFormat(p)} | ${availabilityLabel(p).label}`);
      textLines.push(`  View: ${productUrl(baseUrl, p)}`);
      textLines.push("");
    }
  }

  if (updatedProducts.length) {
    textLines.push("PRODUCT UPDATES");
    textLines.push("---------------");
    for (const p of updatedProducts) {
      textLines.push(`* ${p.name} — Recently Updated (${availabilityLabel(p).label})`);
      textLines.push(`  ${productUrl(baseUrl, p)}`);
    }
    textLines.push("");
  }

  if (featured) {
    textLines.push("SPOTLIGHT: " + featured.name);
    textLines.push("-".repeat(11 + featured.name.length));
    if (featured.shortDescription) textLines.push(featured.shortDescription);
    for (const f of featured.features.slice(0, 3)) textLines.push(`  - ${f}`);
    textLines.push(`  Inquire: ${inquiryUrl(baseUrl, featured)}`);
    textLines.push("");
  }

  textLines.push("WE'RE HERE TO HELP");
  textLines.push("-------------------");
  textLines.push(`Browse all products: ${baseUrl}/products`);
  textLines.push(`Request a quotation: ${baseUrl}/contact`);
  textLines.push(`Speak with a specialist: ${CONTACT.phone}`);
  textLines.push("");
  textLines.push("---");
  textLines.push("MP MedPharma");
  textLines.push(CONTACT.address);
  textLines.push(`${CONTACT.phone} | ${CONTACT.email} | ${baseUrl}`);
  textLines.push("");
  textLines.push(`Unsubscribe: ${unsubscribeUrl}`);
  textLines.push(`Privacy Policy: ${baseUrl}/privacy`);
  textLines.push("");
  textLines.push(
    "Equipment shown may be pre-owned and refurbished; condition, configuration, and availability are confirmed at time of inquiry. Product images are representative and may not depict the exact unit or configuration available. This communication is provided for informational purposes only, does not constitute medical, clinical, or regulatory advice, and is not a binding offer of sale. Specifications are subject to change without notice."
  );

  return { subject, previewText, html, text: textLines.join("\n") };
}
