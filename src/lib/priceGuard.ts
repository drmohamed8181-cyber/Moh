// Prices must never reach a customer by email: quotes go out by other means, and
// dealer/retail figures live only in the internal pricing email. This is the check
// sendMail runs on every customer-facing message, plus helpers for the routes that
// put admin- or catalogue-written text into an email.

// A money amount: a currency sign or code next to a number ("$4,500", "USD 4500",
// "4,500 USD", "4500$", "12k dollars"). Plain numbers (phone numbers, model numbers,
// wavelengths) don't match.
const PRICE_RE =
  /(?:US\s?\$|\$|€|£)\s?\d|\b(?:USD|EUR|GBP)\s?\d|\d[\d,]*(?:\.\d+)?\s?k?\s?(?:\$|€|£|\b(?:USD|EUR|GBP|dollars?|euros?|pounds?)\b)/i;

export function containsPrice(text: string | null | undefined): boolean {
  return Boolean(text) && PRICE_RE.test(text as string);
}

/** Text with markup removed, so an amount split by tags or entities is still caught. */
function visibleText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#36;|&dollar;/g, "$")
    .replace(/&euro;/g, "€")
    .replace(/&pound;/g, "£")
    .replace(/&amp;/g, "&");
}

export function emailContainsPrice(email: { subject: string; html: string; text?: string }): boolean {
  return containsPrice(email.subject) || containsPrice(visibleText(email.html)) || containsPrice(email.text);
}

/** Replace every money amount in `text`, for quoting text the business didn't write (e.g. a customer's own message). */
export function redactPrices(text: string): string {
  // The whole amount: the match plus any remaining digits ("$4" -> "$4,500.00") and a trailing "k".
  const global = new RegExp(`(?:${PRICE_RE.source})(?:,?\\d)*(?:\\.\\d+)?(?:\\s?k\\b)?`, "gi");
  return text.replace(global, "[price removed]");
}

export const PRICE_BLOCKED_ERROR =
  "Emails to customers can't include prices. Remove the amount (for example \"$4,500\" or \"4500 USD\") and send again.";
