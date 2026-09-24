import { SITE_URL } from "@/lib/seo";

// Company signature for mail that goes out as info@mpmedpharma.com (admin replies).
// Keep it in sync with docs/email-signature-info.html, which is the copy pasted into Zoho.
// The logo is loaded from the live site so it isn't sent as an attachment on every reply.

export const INFO_EMAIL = "info@mpmedpharma.com";
const PHONE = "929-349-8569";
const LOCATION = "New Jersey, NJ 07675, USA";
const TAGLINE = "New & refurbished ophthalmic & dental equipment";

const FONT = "font-family:Arial,Helvetica,sans-serif;";
const NAVY = "#0F1B33";
const GOLD = "#A8823D";
const TEXT = "#232838";

function row(label: string, value: string) {
  return `<tr><td style="${FONT}font-size:12px;line-height:18px;color:${GOLD};font-weight:bold;padding:0 8px 0 0;vertical-align:top;">${label}</td><td style="${FONT}font-size:13px;line-height:18px;color:${TEXT};padding:0;">${value}</td></tr>`;
}

export const infoSignatureHtml = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;${FONT}margin-top:24px;">
  <tr>
    <td style="padding:0 18px 0 0;vertical-align:middle;border-right:2px solid #C7A45C;">
      <a href="${SITE_URL}" style="text-decoration:none;"><img src="${SITE_URL}/brand/mp-logo-full.png" width="200" height="50" alt="MP MedPharma Medical Equipment" style="display:block;border:0;width:200px;height:50px;"></a>
    </td>
    <td style="padding:0 0 0 18px;vertical-align:middle;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:22px;font-weight:bold;color:${NAVY};">MP MedPharma Team</div>
      <div style="${FONT}font-size:11px;line-height:16px;letter-spacing:1.5px;text-transform:uppercase;color:${GOLD};font-weight:bold;padding:0 0 8px 0;">Sales &amp; Customer Support</div>
      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
        ${row("T", `<a href="tel:${PHONE.replace(/\D/g, "")}" style="color:${TEXT};text-decoration:none;">${PHONE}</a>`)}
        ${row("E", `<a href="mailto:${INFO_EMAIL}" style="color:${TEXT};text-decoration:none;">${INFO_EMAIL}</a>`)}
        ${row("W", `<a href="${SITE_URL}" style="color:${NAVY};text-decoration:none;font-weight:bold;">www.mpmedpharma.com</a>`)}
        ${row("A", LOCATION)}
      </table>
    </td>
  </tr>
  <tr><td colspan="2" style="padding:12px 0 0 0;${FONT}font-size:12px;line-height:17px;color:#5B6172;font-style:italic;">${TAGLINE.replace(/&/g, "&amp;")}</td></tr>
</table>`;

export const infoSignatureText = [
  "--",
  "MP MedPharma Team",
  "Sales & Customer Support",
  `T: ${PHONE}`,
  `E: ${INFO_EMAIL}`,
  "W: www.mpmedpharma.com",
  LOCATION,
].join("\n");
