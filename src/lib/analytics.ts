// Google Analytics events for the actions that matter to the business: a
// visitor becoming a lead. GA is only loaded on production (see the root
// layout), so on preview and local builds these calls do nothing.
//
// Never pass personal data (names, emails, phone numbers, message text) as an
// event parameter: Google's terms forbid it and the privacy policy says form
// contents are not sent to Google.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type LeadForm = "contact" | "product_inquiry" | "sell_equipment";
type ContactMethod = "phone" | "email" | "whatsapp";

function sendEvent(name: string, params: Record<string, string>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

/** A form that asks us to reply was submitted successfully. */
export function trackLead(form: LeadForm, params: Record<string, string> = {}) {
  sendEvent("generate_lead", { form_name: form, ...params });
}

/** Someone joined the newsletter. `location` says which signup box. */
export function trackNewsletterSignup(location: string) {
  sendEvent("sign_up", { method: "newsletter", location });
}

/** Someone clicked a phone, email or WhatsApp link. */
export function trackContactClick(method: ContactMethod) {
  sendEvent("contact_click", { method, page_path: window.location.pathname });
}
