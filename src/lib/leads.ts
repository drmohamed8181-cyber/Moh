// Shared by the admin Messages page and the weekly follow-up email.

/** A new message with no reply or status change after this many hours triggers a reminder. */
export const NEW_LEAD_REMINDER_HOURS = 12;

/** A quote with no status change for this many days needs a follow-up. */
export const FOLLOW_UP_DAYS = 7;

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;
