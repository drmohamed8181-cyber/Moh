import nodemailer from "nodemailer";
import { Resend } from "resend";
import { emailContainsPrice } from "@/lib/priceGuard";

function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The only inbox that ever receives prices: the owner's inquiry pricing reminder. */
export const PRICING_EMAIL = (process.env.PRICING_NOTIFY_EMAIL || "ma@mpmedpharma.com").trim().toLowerCase();

// Staff inboxes. Staff notifications may quote what a customer typed, amounts included.
function isInternalRecipient(to: string) {
  const address = to.trim().toLowerCase();
  const staff = [
    process.env.CONTACT_NOTIFY_EMAIL,
    process.env.PRODUCT_SUBMISSION_NOTIFY_EMAIL,
    process.env.LEAD_DIGEST_EMAIL,
    "dr.mohamed8181@gmail.com",
  ].filter(Boolean).map((e) => (e as string).trim().toLowerCase());
  return address.endsWith("@mpmedpharma.com") || staff.includes(address);
}

/**
 * `internal: true` marks a staff notification; everything else is treated as going to a customer and is
 * refused if it contains a price. `pricing: true` marks the owner's pricing reminder, which is refused
 * unless it is addressed to PRICING_EMAIL.
 */
export async function sendMail(options: { to: string; subject: string; html: string; text?: string; from?: string; replyTo?: string; internal?: boolean; pricing?: boolean }) {
  if (options.pricing && options.to.trim().toLowerCase() !== PRICING_EMAIL) {
    console.error(`Pricing email not sent: it may only go to ${PRICING_EMAIL}.`);
    return false;
  }
  const toStaff = options.pricing === true || (options.internal === true && isInternalRecipient(options.to));
  if (!toStaff && emailContainsPrice(options)) {
    console.error(`Email not sent: it contains a price and is not addressed to a staff inbox (subject: "${options.subject}").`);
    return false;
  }
  const from = options.from || process.env.SMTP_FROM || process.env.SMTP_USER;
  // Only pass a well-formed Reply-To so a bad address can't make the provider reject the whole message.
  const replyTo = options.replyTo && EMAIL_RE.test(options.replyTo.trim()) ? options.replyTo.trim() : undefined;

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: from || "onboarding@resend.dev",
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo,
      });
      if (error) {
        console.error("Failed to send email via Resend:", error);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Failed to send email via Resend:", e);
      return false;
    }
  }

  const transport = getTransport();
  if (!transport) {
    console.error("Email not sent: no email provider is configured (set RESEND_API_KEY or SMTP_*).");
    return false;
  }
  try {
    await transport.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo,
    });
    return true;
  } catch (e) {
    console.error("Failed to send email:", e);
    return false;
  }
}
