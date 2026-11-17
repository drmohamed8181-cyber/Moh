// Marketing opt-outs (owner's rule, Nov 17, 2026): anyone who unsubscribes gets
// no marketing email again (newsletter campaigns, the biweekly digest) unless
// they reach out to us again. Any new form submission (inquiry, newsletter
// signup, catalog request, notify-me, sell form, registration) counts as
// reaching out: they agree to future communications on that form, so the
// opt-out is lifted. Replies to their own requests are not marketing and are
// never blocked.
import { safeDb } from "@/lib/prisma";

export async function getOptOut(email: string) {
  const address = email.trim().toLowerCase();
  if (!address) return null;
  return safeDb((db) => db.emailOptOut.findUnique({ where: { email: address } }));
}

/** Call when someone contacts us again through any form. */
export async function clearOptOutOnContact(email: string) {
  const address = email.trim().toLowerCase();
  if (!address) return;
  await safeDb((db) => db.emailOptOut.deleteMany({ where: { email: address } }));
}
