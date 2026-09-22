// The partner's (LaserLocators) current ophthalmology list, replaced weekly.
//
// Any ophthalmology product on this site that matches none of these entries is
// shown as "Sold – inquire for similar". Dental and other specialties are not
// affected. Entries can be LaserLocators page URLs or plain model names, one
// per line; matching is by model name (see src/lib/partnerStock.ts).
//
// While the list has fewer than MIN_PARTNER_ENTRIES entries it is treated as
// not yet provided and nothing is marked sold, so an empty or truncated paste
// can never mark the whole catalogue sold.
//
// Changes reach the site on the next deploy; cached pages catch up within an
// hour, or at once after any product is saved in the admin.

export const PARTNER_STOCK_UPDATED = "";

export const PARTNER_STOCK: string[] = [];
