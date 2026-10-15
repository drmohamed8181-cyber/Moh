// Email links on the public site pre-fill a subject so that, in the Zoho inbox,
// an email that started on the website can be told apart from one sent
// directly (the WhatsApp button does the same with its pre-filled first line).
// Visitors can still change the subject before sending.

export const WEBSITE_EMAIL_SUBJECT = "Website inquiry";

export function websiteMailto(email: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(WEBSITE_EMAIL_SUBJECT)}`;
}
